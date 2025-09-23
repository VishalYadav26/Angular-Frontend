import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';

@Component({
  selector: 'app-root',
  standalone: true,                         // ✅ standalone
  imports: [CommonModule, ChatListComponent, ChatWindowComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedChatId: string = '';

  constructor() {}

  onChatSelected(chatId: string) {
    this.selectedChatId = chatId;
  }
}
