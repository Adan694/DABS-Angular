import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
// export class SocketService {
//   private socket!: Socket; // not initialized in constructor
//   private serverUrl = 'http://localhost:3000';

//   connect(token?: string) {
//     const authToken = token || localStorage.getItem('authToken');
//   console.log('Connecting socket with token:', token);

//     if (!authToken) {
//       console.error('❌ No auth token, socket will not connect');
//       return;
//     }

//     this.socket = io(this.serverUrl, {
//       transports: ['websocket', 'polling'], // polling fallback
//       auth: { token: authToken },
//     });

//     this.socket.on('connect', () => console.log('✅ Socket connected'));
//     this.socket.on('connect_error', (err) => {
//       console.error('❌ Socket connection error:', err.message);
//     });
//   }

//   joinChat(userId: string) {
//     if (this.socket) this.socket.emit('join', userId);
//   }

//   openChatWith(otherUserId: string) {
//     if (this.socket) this.socket.emit('openChatWith', { otherUserId });
//   }

//   sendMessage(message: any) {
//     if (this.socket) this.socket.emit('send_message', message);
//   }

//   onMessage(): Observable<any> {
//   return new Observable((observer) => {
//     if (!this.socket) {
//       console.error('⚠️ Socket not initialized');
//       return;
//     }
//     this.socket.on('receive_message', (msg) => observer.next(msg));
//   });
// }


//   onUserStatus(): Observable<any> {
//   return new Observable((observer) => {
//     this.socket.on('userStatusUpdate', (status) => {
//       console.log('📩 Status event received:', status);
//       observer.next(status);
//     });
//   });
// }
// }
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
