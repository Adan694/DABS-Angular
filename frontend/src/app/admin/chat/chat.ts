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
  this.loadChats().then(() => {
    this.socketService.joinChat(this.currentUserId);

    // 🟢 Listen for new messages
   this.socketService.onMessage().subscribe((msg) => {
  const chat = this.chats.find(c => c._id === msg.senderId);

  if (this.selectedChat && msg.senderId === this.selectedChat._id) {
    this.messages.push(msg);
  } else if (chat) {
    chat.unreadCount = (chat.unreadCount || 0) + 1;
  } else {
    // new chat from unknown user
    this.chats.unshift({
      _id: msg.senderId,
      name: 'New Patient',
      email: msg.email || '',
      unreadCount: 1,
      lastMessage: msg.message,
      lastMessageAt: new Date(),
      online: true,
    });
  }

  // Always move updated chat to top
  if (chat) {
    chat.lastMessage = msg.message;
    chat.lastMessageAt = new Date();
    this.chats = [
      chat,
      ...this.chats.filter(c => c._id !== chat._id)
    ];
  }
});



    // 🟢 Listen for status updates (after chats are loaded)
    this.socketService.onUserStatus().subscribe((status) => {
      console.log('📩 Status event received:', status);
      const user = this.chats.find(c => c.email.toLowerCase() === status.email.toLowerCase());
      if (user) {
        user.online = status.online;
        console.log(`✅ Updated ${user.email}: ${user.online}`);
      } else {
        console.log('⚠️ No chat found for', status.email);
      }
    });
  });
}

// loadChats(): Promise<void> {
//   return new Promise((resolve) => {
//     this.chatService.getAllChats().subscribe({
//       next: (res: any[]) => {
//         // 🟢 Safely map chats and sort them
//         this.chats = (res || [])
//           .map((c: any) => ({
//             ...c,
//             unreadCount: c.unreadCount ?? 0, // use nullish coalescing (handles undefined)
//             online: false,
//           }))
//           .sort((a: any, b: any) => {
//             // Sort first by unread count, then by last updated time (if available)
//             if (b.unreadCount !== a.unreadCount) {
//               return b.unreadCount - a.unreadCount;
//             }
//             return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
//           });
//         resolve();
//       },
//       error: (err) => {
//         console.error('Error loading chats:', err);
//         resolve();
//       },
//     });
//   });
// }

loadChats(): Promise<void> {
  return new Promise((resolve) => {
    this.chatService.getAllChats().subscribe({
      next: (res) => {
        // No manual sorting needed — backend already sorted
        this.chats = res.map((c: any) => ({
          ...c,
          unreadCount: c.unreadCount ?? 0,
          online: false,
        }));
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

  // openChat(patient: any) {
  //   this.selectedChat = patient;

  //   this.chatService.getMessages(this.currentUserId, patient._id).subscribe((res) => {
  //     this.messages = res;
  //   });

  //   // ✅ Reset unread count once chat is opened
  //   patient.unreadCount = 0;
  // }
  openChat(chat: any) {
  this.selectedChat = chat;
  this.chatService.getMessages(this.currentUserId, chat._id).subscribe((msgs) => {
    this.messages = msgs;

    // ✅ Mark messages as read
    this.chatService.markMessagesAsRead(chat._id).subscribe(() => {
      chat.unreadCount = 0;
      // 🟢 Move opened chat to top
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
