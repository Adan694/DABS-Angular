import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  createAppointment(payload: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/appointments`, payload, { headers });
  }

  getAppointments(patientId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/appointments/patient/${patientId}`, { headers });
  }

  getAppointmentById(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/appointments/${id}`, { headers });
  }

  getFeedbacksByPatient(patientId: string) {
  const headers = this.getAuthHeaders(); 
  return this.http.get<any[]>(`${this.apiUrl}/feedback/patient/${patientId}`, { headers });
}

  cancelAppointment(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { status: 'Cancelled', canceledBy: 'patient' };
    return this.http.put(`${this.apiUrl}/appointments/${id}/cancel`, body, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  // ✅ Fetch all appointments for a specific doctor
getDoctorAppointments(doctorId: string): Observable<any[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<any[]>(`${this.apiUrl}/appointments/doctor/${doctorId}`, { headers });
}

// ✅ Update appointment status (Completed, Missed, etc.)
updateAppointmentStatus(id: string, status: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.put(`${this.apiUrl}/appointments/${id}/status`, { status }, { headers });
}

// ✅ Cancel by doctor
cancelAppointmentByDoctor(id: string): Observable<any> {
  const headers = this.getAuthHeaders();
  const body = { status: 'Cancelled', canceledBy: 'doctor' };
  return this.http.put(`${this.apiUrl}/appointments/${id}/cancel`, body, { headers });
}

// ✅ Reschedule
rescheduleAppointment(id: string, newDate: string, newTime: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.put(`${this.apiUrl}/appointments/${id}/reschedule`, 
    { newDate, newTime, rescheduledBy: 'doctor' }, 
    { headers }
  );
}

// ✅ Get doctor’s availability
getDoctorAvailability(doctorId: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get<any>(`${this.apiUrl}/doctors/${doctorId}`, { headers });
  }
  getAppointmentsForDoctor(doctorId: string): Observable<any[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<any[]>(`${this.apiUrl}/appointments/doctor/${doctorId}`, { headers });
}
updateDoctorAvailability(doctorId: string, availabilitySlots: any[]): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.put(`${this.apiUrl}/doctors/${doctorId}/availability`, 
    { availabilitySlots }, { headers });
}


}
