export interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  chatId: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
}

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  avatar?: string;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  chatId: string;
}