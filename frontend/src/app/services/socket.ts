import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private serverUrl = 'http://localhost:3000';
private messageObservable$: Observable<any> | null = null;
  private statusObservable$: Observable<any> | null = null;
  // ✅ Use Subjects so we can reuse the same stream
  private messageSubject = new Subject<any>();
  private statusSubject = new Subject<any>();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    let email = null;
    let role = 'admin';

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      email = parsedUser.email;
      role = parsedUser.role;
    }

    console.log(' Socket auth data:', { token, role, email });

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

    // ✅ Attach listeners only once
    this.socket.on('receive_message', (msg) => {
      this.messageSubject.next(msg);
    });

    this.socket.on('userStatusUpdate', (status) => {
      this.statusSubject.next(status);
    });
  }

  connect() {
    if (!this.socket || !this.socket.connected) {
      console.log('🔌 Reconnecting socket...');
      this.initializeSocket();
    }
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

  // ✅ These return Observables from shared Subjects
   onMessage(): Observable<any> {
    if (!this.messageObservable$) {
      this.messageObservable$ = new Observable((observer) => {
        this.socket.off('receive_message'); // remove existing listener
        this.socket.on('receive_message', (msg) => {
          console.log('🟢 Socket received message:', msg);
          observer.next(msg);
        });
      });
    }
    return this.messageObservable$;
  }

  onUserStatus(): Observable<any> {
    return this.statusSubject.asObservable();
  }

  disconnect() {
    if (this.socket && this.socket.connected) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
    }
  }
}
