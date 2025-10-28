import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private serverUrl = 'http://localhost:3000';

  constructor() {
  const token = localStorage.getItem('authToken');

  const storedUser = localStorage.getItem('user');
  let email = null;
  let role = null;

  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    email = parsedUser.email;
    role = parsedUser.role;
  }

  console.log('🧠 Socket auth data:', { token, role, email });

  this.socket = io(this.serverUrl, {
    transports: ['websocket'],
    auth: { token, role, email },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  this.socket.on('connect', () => {
    console.log('✅ Socket connected with ID:', this.socket.id);
  });

  this.socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });
}


  joinChat(userId: string) {
    this.socket.emit('join', userId);
  }

  openChatWith(otherUserId: string) {
    this.socket.emit('openChatWith', { otherUserId });
  }

  sendMessage(message: any) {
    this.socket.emit('send_message', message);
  }

  onMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receive_message', (msg) => observer.next(msg));
    });
  }

  onUserStatus(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('userStatusUpdate', (status) => {
        console.log('📩 Status event received:', status);
        observer.next(status);
      });
    });
  }
  
}
