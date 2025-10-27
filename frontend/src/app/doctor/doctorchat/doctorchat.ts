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
  adminId = 'admin'; // or store admin _id in DB later

  constructor(private chatService: ChatService, private socketService: SocketService, private router: Router) {}

  ngOnInit(): void {
    if (!this.currentUserId) {
      alert('You must be logged in to chat');
      return;
    }

    // join socket room
    this.socketService.openChatWith('admin');
    this.loadMessages();

    // listen for new ones
    this.socketService.onMessage().subscribe((msg) => {
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

    // send to server (store in DB)
    this.chatService.sendMessage(this.currentUserId, this.adminId, this.newMessage).subscribe(() => {
      this.messages.push(message);
      this.newMessage = '';
      this.socketService.sendMessage(message);
    });
  }
}

