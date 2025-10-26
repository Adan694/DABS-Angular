import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private serverUrl = 'http://localhost:3000';

  constructor() {
    const token = localStorage.getItem('authToken');

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      auth: { token },
    });

    this.socket.on('connect', () => console.log('✅ Socket connected'));

    // 🧹 Silently handle harmless "User not found" errors
    this.socket.on('connect_error', (err) => {
      if (err.message !== 'User not found') {
        console.error('❌ Socket connection error:', err.message);
      }
      // No console.log('Full error object:', err);
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
