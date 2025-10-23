import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../services/doctor'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-doc-list',
  imports: [RouterLink, AdminSidebar, CommonModule, FormsModule],
  templateUrl: './admin-doc-list.html',
  styleUrls: ['./admin-doc-list.css']
})
export class AdminDocList implements OnInit {
  doctors: any[] = [];
  userRole: string = '';
  loading = false;
  isSidebarActive = false;
  searchQuery: string = '';
filteredDoctors: any[] = [];

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
    console.log('[AdminDocList] Logging out user...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientEmail');

    console.log('[AdminDocList] Cleared session data. Redirecting to login...');
    this.router.navigate(['/login']);
  }

 fetchDoctors() {
    this.loading = true;
    console.log('Fetching doctors from service...');
    
    this.doctorService.getAllDoctors().subscribe({
      next: (response: any) => {
        console.log('Fetched doctors:', response);
        this.doctors = response || [];
        this.filteredDoctors = [...this.doctors]; 
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching doctors:', error);
        this.doctors = [];
        this.filteredDoctors = [];
        this.loading = false;
      }
    });
  }

  filterDoctors() {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredDoctors = [...this.doctors]; 
      return;
    }

    this.filteredDoctors = this.doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(query) ||
        doctor.speciality?.toLowerCase().includes(query)
    );
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
