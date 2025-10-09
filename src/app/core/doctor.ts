import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  photo: string;
  experience: number;
  availabilitySlots: { date: string; slots: string[] }[];
  averageRating: number;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private baseUrl = 'http://localhost:3000/api/doctors';

  constructor(private http: HttpClient) {}

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/alldoctors`);
  }
}
