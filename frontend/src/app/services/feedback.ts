import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
private apiUrl = `${environment.apiUrl}/feedback`;
  private doctorUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  
  getDoctorById(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.doctorUrl}/${doctorId}`);
  }

 
getFeedbackForDoctor(doctorId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}`);
}


  submitFeedback(payload: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.post<any>(this.apiUrl, payload, { headers });
  }

  updateFeedback(feedbackId: string, updatedData: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.put<any>(`${this.apiUrl}/${feedbackId}`, updatedData, { headers });
  }

  deleteFeedback(feedbackId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.delete<any>(`${this.apiUrl}/${feedbackId}`, { headers });
  }
}
