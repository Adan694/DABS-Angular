import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = 'http://localhost:3000/api/chats';

  constructor(private http: HttpClient) {}

  /** 🟢 Helper: attach Authorization header */
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
    };
  }

  /** 🟢 Get all chat list (for admin sidebar) */
  getAllChats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`, this.getAuthHeaders());
  }

  /** 🟢 Get messages between admin & patient */
  getMessages(userId: string, contactId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}/${contactId}`, this.getAuthHeaders());
  }

  /** 🟢 Send message */
  sendMessage(senderId: string, receiverId: string, message: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/send`,
      { senderId, receiverId, message },
      this.getAuthHeaders()
    );
  }

  /** 🟢 Mark messages as read (reset unread count) */
  markMessagesAsRead(patientId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/mark-read/${patientId}`, {}, this.getAuthHeaders());
  }

  /** 🟢 Get chat list (for sorting/unread tracking) */
  getChatList(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/list/${userId}`, this.getAuthHeaders());
  }
}
