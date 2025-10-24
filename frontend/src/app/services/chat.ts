import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = 'http://localhost:3000/api/chats';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getMessages(userId: string, contactId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}/${contactId}`, this.getAuthHeaders());
  }

  sendMessage(senderId: string, receiverId: string, message: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/send`,
      { senderId, receiverId, message },
      this.getAuthHeaders()
    );
  }
  getAllChats(): Observable<any> {
  return this.http.get(`${this.baseUrl}/all`);
}

}
