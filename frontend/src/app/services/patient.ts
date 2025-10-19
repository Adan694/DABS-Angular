import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatientById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updatePatient(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
