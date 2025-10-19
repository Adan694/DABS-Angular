import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
private apiUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  //  Get all doctors
 getAllDoctors() {
  const url = `${this.apiUrl}`;
  console.log('📡 Fetching doctors from:', url);
  return this.http.get<any[]>(this.apiUrl);
}


  //  Get a single doctor by ID
  getDoctorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  //  Get a doctor's availability slots
  getDoctorAvailability(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${doctorId}/availability`);
  }

  //  Update (edit) feedback — requires token
  updateFeedback(feedbackId: string, updatedFeedback: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<any>(`${environment.apiUrl}/api/feedback/${feedbackId}`, updatedFeedback, { headers });
  }

  //  Delete feedback — requires token
  deleteFeedback(feedbackId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete<any>(`${environment.apiUrl}/api/feedback/${feedbackId}`, { headers });
  }

  updateDoctorProfile(id: string, formData: FormData, token: string) {
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.put(`${this.apiUrl}/${id}`, formData, { headers });
}

}
