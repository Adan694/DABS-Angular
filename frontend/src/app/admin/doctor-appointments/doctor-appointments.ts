import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-appointments',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-appointments.html',
  styleUrl: './doctor-appointments.css'
})

export class AdminDoctorAppointments implements OnInit {
  doctorId!: string | null;
  doctorNameHeading = '';
  appointments: any[] = [];
  loading = true;
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.doctorId = this.route.snapshot.paramMap.get('doctorId');
    if (!this.doctorId) {
      alert('No doctor ID provided');
      return;
    }

    this.fetchDoctorDetails();
    this.fetchAppointments();
  }

  get token(): string | null {
    return localStorage.getItem('authToken');
  }

  fetchDoctorDetails() {
    if (!this.token) return this.redirectToLogin();

    this.http.get(`http://localhost:3000/api/doctors/${this.doctorId}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe({
      next: (doctor: any) => {
        this.doctorNameHeading = `Dr. ${doctor.name}'s Appointments`;
      },
      error: err => console.error('Error fetching doctor details:', err)
    });
  }

  fetchAppointments() {
    if (!this.token) return this.redirectToLogin();

    this.http.get(`http://localhost:3000/api/appointments/doctor/${this.doctorId}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe({
      next: (data: any) => {
        this.appointments = data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Failed to fetch appointments:', err);
      }
    });
  }

  getPatientName(app: any): string {
    return app.patientName ||
           app.patientId?.name ||
           app.patientId?.fullName ||
           'Unknown Patient';
  }

  parseAppointmentDate(dateStr: string, timeStr: string): string {
    if (!dateStr || !timeStr) return 'Invalid Date';
    const datePart = new Date(dateStr).toISOString().split('T')[0];
    const cleanTime = timeStr.replace(/:\d{2}$/, '');
    const dateTimeStr = `${datePart} ${cleanTime}`;
    const parsed = new Date(dateTimeStr);
    return isNaN(parsed.getTime())
      ? 'Invalid Date'
      : parsed.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
  }

  paginatedAppointments() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.appointments.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.appointments.length / this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  redirectToLogin() {
    alert('Please log in again.');
    this.router.navigate(['/login']);
  }
  goBack() {
  this.router.navigate(['/admin/doclist']); 
}

}
