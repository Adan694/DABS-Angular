import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = 'http://localhost:3000/api/chats';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
    };
  }

  getAllChats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`, this.getAuthHeaders());
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

  markMessagesAsRead(patientId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/mark-read/${patientId}`, {}, this.getAuthHeaders());
  }

  getChatList(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/list/${userId}`, this.getAuthHeaders());
  }
  getAllDoctorChats(): Observable<any> {
    return this.http.get('http://localhost:3000/api/doctor-chats/alldoctors', this.getAuthHeaders());
  }


  getDoctorMessages(userId: string, contactId: string) {
    return this.http.get(
      `http://localhost:3000/api/doctor-chats/${userId}/${contactId}`,
      this.getAuthHeaders()
    );
  }

  sendDoctorMessage(senderId: string, receiverId: string, message: string) {
    return this.http.post(
      'http://localhost:3000/api/doctor-chats/send',
      { senderId, receiverId, message },
      this.getAuthHeaders()
    );
  }


  markDoctorMessagesAsRead(doctorId: string) {
    return this.http.post(`http://localhost:3000/api/doctor-chats/mark-read/${doctorId}`, {});
  }


  markAsRead(contactId: string, baseUrl: string) {
    return this.http.post(`${baseUrl}${contactId}`, {});
  }
getPatientDoctorMessages(patientId: string, doctorId: string) {
  return this.http.get<any[]>(
    `${this.baseUrl}/${patientId}/${doctorId}`,
    this.getAuthHeaders()
  );
}

getPatientsByDoctor(doctorId: string) {
  return this.http.get<any[]>(
    `${this.baseUrl}/patients/${doctorId}`,
    this.getAuthHeaders()
  );
}


}
