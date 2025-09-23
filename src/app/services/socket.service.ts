import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { Message, User, Chat, TypingIndicator } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private currentUser = new BehaviorSubject<User | null>(null);
  private onlineUsers = new BehaviorSubject<User[]>([]);
  private messages = new BehaviorSubject<Message[]>([]);
  private chats = new BehaviorSubject<Chat[]>([]);
  private typingUsers = new BehaviorSubject<TypingIndicator[]>([]);

  constructor() {
    // For demo purposes, we'll simulate WebSocket functionality
    this.socket = {} as Socket;
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Demo users
    const demoUsers: User[] = [
      { id: '1', username: 'Alice Johnson', isOnline: true, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: '2', username: 'Bob Smith', isOnline: true, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: '3', username: 'Carol Davis', isOnline: false, lastSeen: new Date(Date.now() - 300000), avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: '4', username: 'David Wilson', isOnline: true, avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ];

    // Demo chats
    const demoChats: Chat[] = [
      {
        id: 'chat1',
        type: 'direct',
        participants: [demoUsers[0], demoUsers[1]],
        unreadCount: 2,
        createdAt: new Date(Date.now() - 86400000),
        lastMessage: {
          id: 'msg1',
          senderId: '1',
          senderName: 'Alice Johnson',
          content: 'Hey! How are you doing?',
          timestamp: new Date(Date.now() - 3600000),
          chatId: 'chat1',
          messageType: 'text',
          isRead: false
        }
      },
      {
        id: 'chat2',
        name: 'Project Team',
        type: 'group',
        participants: demoUsers,
        unreadCount: 5,
        createdAt: new Date(Date.now() - 172800000),
        avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        lastMessage: {
          id: 'msg2',
          senderId: '2',
          senderName: 'Bob Smith',
          content: 'The new features are ready for testing!',
          timestamp: new Date(Date.now() - 1800000),
          chatId: 'chat2',
          messageType: 'text',
          isRead: false
        }
      },
      {
        id: 'chat3',
        type: 'direct',
        participants: [demoUsers[0], demoUsers[2]],
        unreadCount: 0,
        createdAt: new Date(Date.now() - 259200000),
        lastMessage: {
          id: 'msg3',
          senderId: '3',
          senderName: 'Carol Davis',
          content: 'Thanks for your help!',
          timestamp: new Date(Date.now() - 7200000),
          chatId: 'chat3',
          messageType: 'text',
          isRead: true
        }
      }
    ];

    this.onlineUsers.next(demoUsers);
    this.chats.next(demoChats);
    this.currentUser.next({ id: 'current', username: 'You', isOnline: true });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getOnlineUsers(): Observable<User[]> {
    return this.onlineUsers.asObservable();
  }

  getChats(): Observable<Chat[]> {
    return this.chats.asObservable();
  }

  getMessages(): Observable<Message[]> {
    return this.messages.asObservable();
  }

  getTypingUsers(): Observable<TypingIndicator[]> {
    return this.typingUsers.asObservable();
  }

  sendMessage(chatId: string, content: string): void {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current',
      senderName: 'You',
      content,
      timestamp: new Date(),
      chatId,
      messageType: 'text',
      isRead: true
    };

    const currentMessages = this.messages.value;
    this.messages.next([...currentMessages, newMessage]);

    // Update last message in chat
    const chats = this.chats.value;
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: newMessage }
        : chat
    );
    this.chats.next(updatedChats);
  }

  loadMessagesForChat(chatId: string): void {
    // Demo messages for different chats
    const demoMessages: { [key: string]: Message[] } = {
      'chat1': [
        {
          id: 'msg1-1',
          senderId: '1',
          senderName: 'Alice Johnson',
          content: 'Hey! How are you doing?',
          timestamp: new Date(Date.now() - 3600000),
          chatId: 'chat1',
          messageType: 'text',
          isRead: false
        },
        {
          id: 'msg1-2',
          senderId: 'current',
          senderName: 'You',
          content: 'I\'m doing great! Thanks for asking. How about you?',
          timestamp: new Date(Date.now() - 3300000),
          chatId: 'chat1',
          messageType: 'text',
          isRead: true
        },
        {
          id: 'msg1-3',
          senderId: '1',
          senderName: 'Alice Johnson',
          content: 'Pretty good! Working on some exciting projects.',
          timestamp: new Date(Date.now() - 3000000),
          chatId: 'chat1',
          messageType: 'text',
          isRead: false
        }
      ],
      'chat2': [
        {
          id: 'msg2-1',
          senderId: '2',
          senderName: 'Bob Smith',
          content: 'Good morning everyone! Ready for the sprint review?',
          timestamp: new Date(Date.now() - 7200000),
          chatId: 'chat2',
          messageType: 'text',
          isRead: true
        },
        {
          id: 'msg2-2',
          senderId: '4',
          senderName: 'David Wilson',
          content: 'Yes! I\'ve prepared the demo for the new features.',
          timestamp: new Date(Date.now() - 6900000),
          chatId: 'chat2',
          messageType: 'text',
          isRead: true
        },
        {
          id: 'msg2-3',
          senderId: '2',
          senderName: 'Bob Smith',
          content: 'The new features are ready for testing!',
          timestamp: new Date(Date.now() - 1800000),
          chatId: 'chat2',
          messageType: 'text',
          isRead: false
        }
      ],
      'chat3': [
        {
          id: 'msg3-1',
          senderId: 'current',
          senderName: 'You',
          content: 'Hi Carol! I saw your question about the API documentation.',
          timestamp: new Date(Date.now() - 14400000),
          chatId: 'chat3',
          messageType: 'text',
          isRead: true
        },
        {
          id: 'msg3-2',
          senderId: '3',
          senderName: 'Carol Davis',
          content: 'Thanks for your help!',
          timestamp: new Date(Date.now() - 7200000),
          chatId: 'chat3',
          messageType: 'text',
          isRead: true
        }
      ]
    };

    this.messages.next(demoMessages[chatId] || []);
  }

  startTyping(chatId: string): void {
    // Simulate typing indicator
    console.log(`Started typing in chat ${chatId}`);
  }

  stopTyping(chatId: string): void {
    // Simulate stop typing
    console.log(`Stopped typing in chat ${chatId}`);
  }

  createDirectChat(userId: string): string {
    const newChatId = `chat_${Date.now()}`;
    const users = this.onlineUsers.value;
    const targetUser = users.find(u => u.id === userId);
    
    if (targetUser) {
      const newChat: Chat = {
        id: newChatId,
        type: 'direct',
        participants: [targetUser],
        unreadCount: 0,
        createdAt: new Date()
      };

      const currentChats = this.chats.value;
      this.chats.next([newChat, ...currentChats]);
    }

    return newChatId;
  }

  createGroupChat(name: string, userIds: string[]): string {
    const newChatId = `group_${Date.now()}`;
    const users = this.onlineUsers.value;
    const participants = users.filter(u => userIds.includes(u.id));
    
    const newChat: Chat = {
      id: newChatId,
      name,
      type: 'group',
      participants,
      unreadCount: 0,
      createdAt: new Date(),
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    };

    const currentChats = this.chats.value;
    this.chats.next([newChat, ...currentChats]);

    return newChatId;
  }
}