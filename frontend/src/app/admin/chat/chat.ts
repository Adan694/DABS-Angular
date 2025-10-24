import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat';
import { SocketService } from '../../services/socket';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer, RouterLink],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class AdminChat implements OnInit {
  chats: any[] = []; 
  selectedChat: any = null;
  messages: any[] = [];
  newMessage = '';
  currentUserId = localStorage.getItem('adminId') || 'admin';

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadChats();
    this.socketService.joinChat(this.currentUserId);

    // 🟢 Listen for new messages in real time
    this.socketService.onMessage().subscribe((msg) => {
      if (this.selectedChat && msg.senderId === this.selectedChat._id) {
        // Currently chatting with sender → just show it
        this.messages.push(msg);
      } else {
        // 🔔 Add unread count for the patient who sent the message
        const chat = this.chats.find(c => c._id === msg.senderId);
        if (chat) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }
      }
    });
  }

  loadChats() {
    this.chatService.getAllChats().subscribe({
      next: (res) => {
        // Ensure each chat has unreadCount field
        this.chats = res.map((c: any) => ({ ...c, unreadCount: 0 }));
      },
      error: (err) => console.error("Error loading chats:", err)
    });
  }

  goToDashboard() {
    this.router.navigate(['/admin']);
  }

  openChat(patient: any) {
    this.selectedChat = patient;

    this.chatService.getMessages(this.currentUserId, patient._id).subscribe((res) => {
      this.messages = res;
    });

    // ✅ Reset unread count once chat is opened
    patient.unreadCount = 0;
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = {
      senderId: this.currentUserId,
      receiverId: this.selectedChat._id,
      message: this.newMessage,
    };

    this.chatService.sendMessage(message.senderId, message.receiverId, message.message).subscribe(() => {
      this.messages.push(message);
      this.newMessage = '';
      this.socketService.sendMessage(message);
    });
  }

  contextMenuVisible = false;
menuX = 0;
menuY = 0;
selectedChatContext: any = null;

onRightClick(event: MouseEvent, chat: any) {
  event.preventDefault();
  this.contextMenuVisible = true;
  this.menuX = event.clientX;
  this.menuY = event.clientY;
  this.selectedChatContext = chat;
}

hideContextMenu() {
  this.contextMenuVisible = false;
}

clearChat(chat: any) {
  this.contextMenuVisible = false;
  if (!chat?._id) return;

  if (confirm(`Are you sure you want to clear all messages with ${chat.name || chat.email}?`)) {
    this.http.delete(`http://localhost:3000/api/chats/clear/${chat._id}`)
      .subscribe({
        next: (res: any) => {
          console.log('🧹 Chat cleared:', res);
          alert('All messages cleared.');
          
          // ✅ Clear messages locally if the same chat is open
          if (this.selectedChat?._id === chat._id) {
            this.messages = [];
          }
        },
        error: (err) => {
          console.error('❌ Error clearing chat:', err);
          alert('Failed to clear chat.');
        }
      });
  }
}

deleteChat(chat: any) {
  if (!chat?._id) return;
  
  if (confirm(`Are you sure you want to permanently delete chat with ${chat.name || chat.email}?`)) {
    this.http.delete(`http://localhost:3000/api/chats/${chat._id}`)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Chat deleted:', res);
          alert('Chat permanently deleted.');
          this.chats = this.chats.filter(c => c._id !== chat._id);
          if (this.selectedChat?._id === chat._id) {
            this.selectedChat = null;
            this.messages = [];
          }
        },
        error: (err) => {
          console.error('❌ Error deleting chat:', err);
          alert('Failed to delete chat.');
        }
      });
  }
}

}
