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
currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';

  chatType: 'patients' | 'doctors' = 'patients';

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadChats().then(() => {
 setTimeout(() => {
      this.socketService.joinChat(this.currentUserId);
      console.log("✅ Joined admin room:", this.currentUserId);
    }, 500);
      //  Listen for incoming messages
      this.socketService.onMessage().subscribe((msg) => {
              console.log("📩 Admin received via socket:", msg);

        const chat = this.chats.find(c => c._id === msg.senderId);

        if (this.selectedChat && msg.senderId === this.selectedChat._id) {
          this.messages.push(msg);
        } else if (chat) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        } else {
          this.chats.unshift({
            _id: msg.senderId,
            name: this.chatType === 'patients' ? 'New Patient' : 'New Doctor',
            email: msg.email || '',
            unreadCount: 1,
            lastMessage: msg.message,
            lastMessageAt: new Date(),
            online: true,
          });
        }

        if (chat) {
          chat.lastMessage = msg.message;
          chat.lastMessageAt = new Date();
          this.chats = [chat, ...this.chats.filter(c => c._id !== chat._id)];
        }
      });

      // this.socketService.onUserStatus().subscribe((status) => {
      //     console.log('📩 Received userStatusUpdate:', status);

      //   const user = this.chats.find(c => c.email?.toLowerCase() === status.email?.toLowerCase());
      //   if (user) user.online = status.online;
      //       console.log(`✅ Updated ${user.name || user.email} online = ${user.online}`);

      // });
      this.socketService.onUserStatus().subscribe((status) => {
  console.log('📩 Received userStatusUpdate:', status);

  // Match by userId instead of email
  const user = this.chats.find(c => c._id === status.userId);
  if (user) {
    user.online = status.online;
    console.log(`✅ Updated ${user.name || user.email} online = ${user.online}`);
  } else {
    console.warn('⚠️ Status update received for unknown user', status);
  }
});

    });
  }

  switchChatType(type: 'patients' | 'doctors') {
    this.chatType = type;
    this.selectedChat = null;
    this.messages = [];
    this.loadChats();
  }

  loadChats(): Promise<void> {
    return new Promise((resolve) => {
      const apiCall =
        this.chatType === 'patients'
          ? this.chatService.getAllChats()
          : this.chatService.getAllDoctorChats();

      apiCall.subscribe({
        next: (res) => {
          
            console.log("Loaded chats:", res);
          this.chats = (res || []).map((c: any) => ({
            ...c,
            unreadCount: c.unreadCount ?? 0,
            online: false,
          }));
                  console.log("✅ Processed chats:", this.chats);

          resolve();
        },
        error: (err) => {
          console.error("Error loading chats:", err);
          resolve();
        },
      });
    });
  }

  goToDashboard() {
    this.router.navigate(['/admin']);
  }

  openChat(chat: any) {
    this.selectedChat = chat;

    const apiCall =
      this.chatType === 'patients'
        ? this.chatService.getMessages(this.currentUserId, chat._id)
        : this.chatService.getDoctorMessages(this.currentUserId, chat._id);

    apiCall.subscribe((msgs) => {
      this.messages = msgs;

      const markRead =
        this.chatType === 'patients'
          ? this.chatService.markMessagesAsRead(chat._id)
          : this.chatService.markDoctorMessagesAsRead(chat._id);

      markRead.subscribe(() => {
        chat.unreadCount = 0;
        this.chats = [chat, ...this.chats.filter(c => c._id !== chat._id)];
      });
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = {
      senderId: this.currentUserId,
      receiverId: this.selectedChat._id,
      message: this.newMessage,
    };

    const sendApi =
      this.chatType === 'patients'
        ? this.chatService.sendMessage(message.senderId, message.receiverId, message.message)
        : this.chatService.sendDoctorMessage(message.senderId, message.receiverId, message.message);

    sendApi.subscribe(() => {
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

    const endpoint =
      this.chatType === 'patients'
        ? 'chats'
        : 'doctor-chats';

    this.http.delete(`http://localhost:3000/api/${endpoint}/clear/${chat._id}`)
      .subscribe({
        next: () => {
          if (this.selectedChat?._id === chat._id) this.messages = [];
        },
        error: (err) => console.error('❌ Error clearing chat:', err),
      });
  }

  deleteChat(chat: any) {
    if (!chat?._id) return;

    const endpoint =
      this.chatType === 'patients'
        ? 'chats'
        : 'doctor-chats';

    this.http.delete(`http://localhost:3000/api/${endpoint}/${chat._id}`)
      .subscribe({
        next: () => {
          this.chats = this.chats.filter(c => c._id !== chat._id);
          if (this.selectedChat?._id === chat._id) {
            this.selectedChat = null;
            this.messages = [];
          }
        },
        error: (err) => console.error('❌ Error deleting chat:', err),
      });
  }
}
