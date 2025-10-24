import { Component, OnInit } from '@angular/core';

import { ChatService } from '../../services/chat';
import { SocketService } from '../../services/socket';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule, Navbar, Footer],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
  
export class Chat implements OnInit {
  messages: any[] = [];
  newMessage = '';
  currentUserId = localStorage.getItem('patientId') || ''; // patient
  adminId = 'admin'; // or store admin _id in DB later

  constructor(private chatService: ChatService, private socketService: SocketService, private router: Router) {}

  ngOnInit(): void {
    if (!this.currentUserId) {
      alert('You must be logged in to chat');
      return;
    }

    // join socket room
  this.socketService.openChatWith('admin');

    // load previous messages
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
  goBack() {
  this.router.navigate(['/patient/profile']);
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

