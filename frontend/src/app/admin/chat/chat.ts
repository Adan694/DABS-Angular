import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat';
import { SocketService } from '../../services/socket';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer, RouterLink],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class AdminChat implements OnInit, OnDestroy {
  chats: any[] = [];
  selectedChat: any = null;
  messages: any[] = [];
  newMessage = '';

  private msgSub!: Subscription;  
  private statusSub!: Subscription;
  private onlineUsersSub!: Subscription;
    private allOnlineUserIds: string[] = [];


  currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';
  chatType: 'patients' | 'doctors' = 'patients';

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router,
    private http: HttpClient
  ) {}
ngOnInit() {
  console.log("🟡 Admin chat component initialized");
  
  this.socketService.connect();
  
  this.loadChats().then(() => {
    this.setupSocketListeners();
        setTimeout(() => {
      this.socketService.requestOnlineUsers();
    }, 1000);
  });
}

  private setupSocketListeners() {

    this.socketService.onCurrentOnlineUsers().subscribe((onlineUserIds: string[]) => {
    console.log(' Received currentOnlineUsers:', onlineUserIds);
    this.allOnlineUserIds = onlineUserIds;
    this.chats.forEach(chat => {
    chat.online = this.allOnlineUserIds.includes(chat._id);
  });
  
  console.log(` Updated online status for ${this.chats.filter(c => c.online).length} users`);
    });
    
    this.statusSub = this.socketService.onUserStatus().subscribe((status: any) => {
    console.log(' Received userStatusUpdate:', status);
  
  if (status.online) {
    if (!this.allOnlineUserIds.includes(status.userId)) {
      this.allOnlineUserIds.push(status.userId);
    }
  } else {
    this.allOnlineUserIds = this.allOnlineUserIds.filter(id => id !== status.userId);
  }
  
  // UPDATE CURRENT CHAT LIST
  const user = this.chats.find(c => c._id === status.userId);
  if (user) {
    user.online = status.online;
    console.log(`Updated ${user.name || user.email} online status to: ${user.online}`);
  }
});

    //  Listen for new messages
    this.msgSub = this.socketService.onMessage().subscribe((msg) => {
      console.log("Admin received message via socket:", msg);
      this.handleIncomingMessage(msg);
    });
  }

  // Add this helper method to handle incoming messages
  private handleIncomingMessage(msg: any) {
    const chat = this.chats.find(c => c._id === msg.senderId);

    if (this.selectedChat && msg.senderId === this.selectedChat._id) {
      this.messages.push(msg);
    } else if (chat) {
      chat.unreadCount = (chat.unreadCount || 0) + 1;
    } else {
      // If it's a new user, add them to chat list and mark as online
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
  }

  //  Unsubscribe properly to prevent double messages
  ngOnDestroy() {
    this.msgSub?.unsubscribe();
    this.statusSub?.unsubscribe();
    this.onlineUsersSub?.unsubscribe();
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
        console.log(" Loaded chats:", res);
        
        //  PRESERVE ONLINE STATUS FROM STORED LIST
        this.chats = (res || []).map((c: any) => ({
          ...c,
          unreadCount: c.unreadCount ?? 0,
          online: this.allOnlineUserIds.includes(c._id) // Check if user is in online list
        }));
        
        console.log(` Applied online status to ${this.chats.filter(c => c.online).length} users`);
        resolve();
      },
      error: (err) => {
        console.error("❌ Error loading chats:", err);
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
    if (!this.newMessage.trim() || !this.selectedChat?._id) return;

    const message = {
      senderId: this.currentUserId,
      receiverId: this.selectedChat._id,
      message: this.newMessage.trim(),
    };

    this.socketService.sendMessage(message);

    this.messages.push({ ...message, pending: true });

    this.newMessage = '';
  }

  // --- Context Menu ---
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
      this.chatType === 'patients' ? 'chats' : 'doctor-chats';

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
      this.chatType === 'patients' ? 'chats' : 'doctor-chats';

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