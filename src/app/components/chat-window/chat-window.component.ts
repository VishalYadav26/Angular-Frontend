import { Component, Input, OnInit, OnChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { Message, Chat, User } from '../../models/chat.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-window" *ngIf="currentChat">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-info">
          <div class="chat-avatar">
            <img [src]="getChatAvatar()" [alt]="getChatName()" />
            <span 
              *ngIf="currentChat.type === 'direct' && isUserOnline()" 
              class="online-indicator"
            ></span>
          </div>
          <div class="chat-details">
            <h3>{{ getChatName() }}</h3>
            <p>{{ getChatStatus() }}</p>
          </div>
        </div>
        <div class="chat-actions">
          <button class="action-btn">📞</button>
          <button class="action-btn">📹</button>
          <button class="action-btn">ℹ️</button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-container" #messagesContainer>
        <div class="messages-list">
          <div 
            *ngFor="let message of messages$ | async; trackBy: trackMessage" 
            class="message-wrapper"
            [class.own-message]="message.senderId === 'current'"
          >
            <div class="message-bubble">
              <div class="message-header" *ngIf="currentChat.type === 'group' && message.senderId !== 'current'">
                <span class="sender-name">{{ message.senderName }}</span>
              </div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <!-- Typing Indicator -->
          <div *ngIf="isTyping" class="typing-indicator">
            <div class="typing-bubble">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="message-input">
          <button class="attachment-btn">📎</button>
          <input 
            type="text" 
            placeholder="Type a message..."
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            (input)="onTyping()"
            #messageInput
          />
          <button class="emoji-btn">😊</button>
          <button 
            class="send-btn"
            (click)="sendMessage()"
            [disabled]="!newMessage.trim()"
          >
            ➤
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" *ngIf="!currentChat">
      <div class="empty-content">
        <div class="empty-icon">💬</div>
        <h3>Welcome to Chat</h3>
        <p>Select a conversation to start messaging</p>
      </div>
    </div>
  `,
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() chatId: string = '';
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  currentChat: Chat | null = null;
  messages$: Observable<Message[]>;
  newMessage = '';
  isTyping = false;
  typingTimeout: any;

  constructor(private socketService: SocketService) {
    this.messages$ = this.socketService.getMessages();
  }

  ngOnInit() {}

  ngOnChanges() {
    if (this.chatId) {
      this.loadChat();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private loadChat() {
    this.socketService.getChats().subscribe(chats => {
      this.currentChat = chats.find(chat => chat.id === this.chatId) || null;
      if (this.currentChat) {
        this.socketService.loadMessagesForChat(this.chatId);
      }
    });
  }

  getChatName(): string {
    if (!this.currentChat) return '';
    if (this.currentChat.type === 'group') {
      return this.currentChat.name || 'Group Chat';
    }
    return this.currentChat.participants[0]?.username || 'Unknown User';
  }

  getChatAvatar(): string {
    if (!this.currentChat) return '';
    if (this.currentChat.type === 'group') {
      return this.currentChat.avatar || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    }
    return this.currentChat.participants[0]?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
  }

  getChatStatus(): string {
    if (!this.currentChat) return '';
    if (this.currentChat.type === 'group') {
      return `${this.currentChat.participants.length} members`;
    }
    const user = this.currentChat.participants[0];
    return user?.isOnline ? 'Online' : `Last seen ${this.formatTime(user?.lastSeen)}`;
  }

  isUserOnline(): boolean {
    if (!this.currentChat || this.currentChat.type === 'group') return false;
    return this.currentChat.participants[0]?.isOnline || false;
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.chatId) return;

    this.socketService.sendMessage(this.chatId, this.newMessage.trim());
    this.newMessage = '';
    this.stopTyping();
  }

  onTyping() {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socketService.startTyping(this.chatId);
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  private stopTyping() {
    if (this.isTyping) {
      this.isTyping = false;
      this.socketService.stopTyping(this.chatId);
    }
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  }

  trackMessage(index: number, message: Message): string {
    return message.id;
  }
}