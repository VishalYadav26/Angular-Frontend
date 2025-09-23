import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { Chat } from '../../models/chat.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-list">
      <div class="chat-list-header">
        <h3>Messages</h3>
        <button class="new-chat-btn" (click)="showNewChatModal = true">+</button>
      </div>
      
      <div class="search-bar">
        <input type="text" placeholder="Search conversations..." />
      </div>

      <div class="chat-items">
        <div 
          *ngFor="let chat of chats$ | async" 
          class="chat-item"
          [class.active]="selectedChatId === chat.id"
          (click)="selectChat(chat.id)"
        >
          <div class="chat-avatar">
            <img [src]="getChatAvatar(chat)" [alt]="getChatName(chat)" />
            <span 
              *ngIf="chat.type === 'direct' && isUserOnline(chat)" 
              class="online-indicator"
            ></span>
          </div>
          
          <div class="chat-info">
            <div class="chat-header">
              <h4>{{ getChatName(chat) }}</h4>
              <span class="timestamp">{{ formatTime(chat.lastMessage?.timestamp) }}</span>
            </div>
            <div class="chat-preview">
              <p>{{ chat.lastMessage?.content || 'No messages yet' }}</p>
              <span *ngIf="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- New Chat Modal -->
      <div *ngIf="showNewChatModal" class="modal-overlay" (click)="showNewChatModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Start New Chat</h3>
          <div class="modal-tabs">
            <button 
              [class.active]="newChatType === 'direct'"
              (click)="newChatType = 'direct'"
            >Direct Message</button>
            <button 
              [class.active]="newChatType === 'group'"
              (click)="newChatType = 'group'"
            >Group Chat</button>
          </div>
          
          <div *ngIf="newChatType === 'group'" class="group-name-input">
            <input 
              type="text" 
              placeholder="Group name..."
              [(ngModel)]="newGroupName"
            />
          </div>
          
          <div class="user-list">
            <div 
              *ngFor="let user of onlineUsers$ | async" 
              class="user-item"
              (click)="toggleUserSelection(user.id)"
            >
              <div class="user-avatar">
                <img [src]="user.avatar" [alt]="user.username" />
                <span *ngIf="user.isOnline" class="online-indicator"></span>
              </div>
              <div class="user-info">
                <h4>{{ user.username }}</h4>
                <p>{{ user.isOnline ? 'Online' : 'Last seen ' + formatTime(user.lastSeen) }}</p>
              </div>
              <div class="user-select">
                <input 
                  type="checkbox" 
                  [checked]="selectedUsers.includes(user.id)"
                  (change)="toggleUserSelection(user.id)"
                />
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button (click)="showNewChatModal = false">Cancel</button>
            <button 
              (click)="createNewChat()"
              [disabled]="selectedUsers.length === 0"
              class="primary"
            >Create Chat</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  @Output() chatSelected = new EventEmitter<string>();
  
  chats$: Observable<Chat[]>;
  onlineUsers$: Observable<any[]>;
  selectedChatId: string = '';
  showNewChatModal = false;
  newChatType: 'direct' | 'group' = 'direct';
  newGroupName = '';
  selectedUsers: string[] = [];

  constructor(private socketService: SocketService) {
    this.chats$ = this.socketService.getChats();
    this.onlineUsers$ = this.socketService.getOnlineUsers();
  }

  ngOnInit() {}

  selectChat(chatId: string) {
    this.selectedChatId = chatId;
    this.chatSelected.emit(chatId);
  }

  getChatName(chat: Chat): string {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    return chat.participants[0]?.username || 'Unknown User';
  }

  getChatAvatar(chat: Chat): string {
    if (chat.type === 'group') {
      return chat.avatar || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    }
    return chat.participants[0]?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
  }

  isUserOnline(chat: Chat): boolean {
    if (chat.type === 'direct') {
      return chat.participants[0]?.isOnline || false;
    }
    return false;
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  }

  toggleUserSelection(userId: string) {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      if (this.newChatType === 'direct') {
        this.selectedUsers = [userId];
      } else {
        this.selectedUsers.push(userId);
      }
    }
  }

  createNewChat() {
    if (this.selectedUsers.length === 0) return;

    let chatId: string;
    if (this.newChatType === 'direct') {
      chatId = this.socketService.createDirectChat(this.selectedUsers[0]);
    } else {
      chatId = this.socketService.createGroupChat(this.newGroupName, this.selectedUsers);
    }

    this.selectChat(chatId);
    this.showNewChatModal = false;
    this.selectedUsers = [];
    this.newGroupName = '';
  }
}