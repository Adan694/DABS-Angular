import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Dashboard stats
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/user-counts`, {
      headers: this.getAuthHeaders(),
    });
  }

  getTodaysAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/todays-appointments`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Time series charts
  getPatientsTimeSeries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/patients-time-series`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAppointmentsTimeSeries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/appointments-time-series`, {
      headers: this.getAuthHeaders(),
    });
  }

  getDoctorsTimeSeries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/doctors-time-series`, {
      headers: this.getAuthHeaders(),
    });
  }
  getAllAppointments(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/appointments/all`, { headers: this.getAuthHeaders() });
  }

  // Get doctor details
  getDoctorById(doctorId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/doctors/${doctorId}`, { headers: this.getAuthHeaders() });
  }

  // Get doctor availability
  getDoctorAvailability(doctorId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/doctors/${doctorId}/availability`, { headers: this.getAuthHeaders() });
  }

  // Reschedule appointment
  rescheduleAppointment(appointmentId: string, date: string, time: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}/reschedule`, { date, time }, { headers: this.getAuthHeaders() });
  }

  addDoctor(doctorData: any) {
  return this.http.post(`${this.apiUrl}/doctors/add`, doctorData, { headers: this.getAuthHeaders() });
  }

  // Get all patients
getAllPatients(): Observable<any> {
  return this.http.get(`${this.apiUrl}/patients`, { headers: this.getAuthHeaders() });
}

// Delete patient by ID
deletePatient(patientId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/patients/${patientId}`, { headers: this.getAuthHeaders() });
}

// Activate / Deactivate patient
togglePatientStatus(patientId: string, action: 'activate' | 'deactivate'): Observable<any> {
  return this.http.patch(`${this.apiUrl}/patients/${patientId}/${action}`, {}, { headers: this.getAuthHeaders() });
  }

  getAllFeedback(): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/feedback/admin/all`, {
    headers: this.getAuthHeaders()
  });
}

// Delete feedback by ID
deleteFeedback(feedbackId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/feedback/${feedbackId}`, {
    headers: this.getAuthHeaders()
  });
}

}
