import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/patient'; 

  constructor(private http: HttpClient) { }

  getAllDoctors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/doctors`);
  }

  getDoctor(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/doctors/${id}`);
  }

  getMyAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/myappointments`);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, data);
  }
}
