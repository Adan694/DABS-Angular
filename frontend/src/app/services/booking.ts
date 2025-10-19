import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  bookAppointment(data: any) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  checkAvailability(doctorId: string, date: string) {
    return this.http.get(`${this.apiUrl}/availability/${doctorId}?date=${date}`);
  }
}
