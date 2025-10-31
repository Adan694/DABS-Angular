import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat';
import { SocketService } from '../../services/socket';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DoctorNavbar } from '../../shared/doctor-navbar/doctor-navbar';

@Component({
  selector: 'app-doctorchat',
  imports: [FormsModule, CommonModule, DoctorNavbar],
  templateUrl: './doctorchat.html',
  styleUrl: './doctorchat.css'
})
export class DoctorChat implements OnInit {
  messages: any[] = [];
  newMessage = '';
  currentUserId = localStorage.getItem('doctorId') || ''; 
  adminId = '689f5be6e5432f608d4b3a54'; // ideally use admin _id from DB later

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.currentUserId) {
      alert('You must be logged in to chat');
      return;
    }

    // ✅ join the doctor’s own socket room
setTimeout(() => {
    this.socketService.joinChat(this.currentUserId);
  }, 500);

    // load old messages
    this.loadMessages();

    // ✅ listen for real-time messages
    this.socketService.onMessage().subscribe((msg) => {
      // only add messages belonging to this chat
      if (
        (msg.senderId === this.adminId && msg.receiverId === this.currentUserId) ||
        (msg.senderId === this.currentUserId && msg.receiverId === this.adminId)
      ) {
        this.messages.push(msg);
      }
    });
  }

  loadMessages() {
    this.chatService.getMessages(this.currentUserId, this.adminId).subscribe((res) => {
      this.messages = res;
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = {
      senderId: this.currentUserId,
      receiverId: this.adminId,
      message: this.newMessage,
    };

    // ✅ save to DB first
    // this.chatService.sendMessage(message.senderId, message.receiverId, message.message).subscribe(() => {
      // show instantly for sender
      this.messages.push(message);
      this.newMessage = '';

      // ✅ emit via socket to admin in real-time
      this.socketService.sendMessage(message);
    // });
  }
  
  goBack() {
    this.router.navigate(['/doctor']); // 👈 change path if your doctor panel route differs
  }
}
