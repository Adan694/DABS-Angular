import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../services/doctor'; // import the service

@Component({
  selector: 'app-admin-doc-list',
  imports: [RouterLink, AdminSidebar, CommonModule],
  templateUrl: './admin-doc-list.html',
  styleUrls: ['./admin-doc-list.css']
})
export class AdminDocList implements OnInit {
  doctors: any[] = [];
  userRole: string = '';
  loading = false;
  isSidebarActive = false;

  constructor(private doctorService: DoctorService, private router: Router) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('userRole') || 'patient';
    this.fetchDoctors();
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  closeSidebar() {
    this.isSidebarActive = false;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  fetchDoctors() {
    this.loading = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (response: any) => {
        this.doctors = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching doctors:', error);
        this.loading = false;
      }
    });
  }

  seeAppointments(doctorId: string) {
    this.router.navigate(['/admin/doctor-appointments', doctorId]);
  }

  deleteDoctor(doctorId: string) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Authentication token missing. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.doctorService.updateDoctorProfile(doctorId, new FormData(), token).subscribe({
      next: () => {
        alert('Doctor deleted successfully');
        this.fetchDoctors();
      },
      error: (error) => {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor.');
      },
      complete: () => (this.loading = false)
    });
  }
}
