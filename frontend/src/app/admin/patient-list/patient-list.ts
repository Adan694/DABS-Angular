
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-patient-list',
  imports: [AdminSidebar, RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css'
})


export class PatientsList implements OnInit {
  allPatients: any[] = [];
  filteredPatients: any[] = [];
  currentPage = 1;
  rowsPerPage = 5;
  searchQuery = '';
  loaderVisible = false;
  sidebarActive = false;

  constructor(private http: HttpClient, public router: Router, private adminService: AdminService) {}

  ngOnInit() {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      alert('Access denied. Admins only.');
      this.router.navigate(['/login']);
      return;
    }
    this.fetchPatients();
  }

  fetchPatients() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
this.adminService.getAllPatients().subscribe({
        next: (patients) => {
          if (!Array.isArray(patients)) {
            alert('Unexpected response.');
            return;
          }
          this.allPatients = patients;
          this.filteredPatients = [...patients];
          this.currentPage = 1;
        },
        error: (err) => {
          if (err.status === 403) {
            alert('Session expired. Please login again.');
            this.router.navigate(['/login']);
          }
          console.error('Error fetching patients:', err);
        }
      });
  }

  deletePatient(id: string) {
    if (!confirm('Are you sure you want to delete this patient profile?')) return;
    this.showLoader();

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });

   this.adminService.deletePatient(id).subscribe({
        next: () => {
          this.hideLoader();
          alert('Patient deleted successfully.');
          this.fetchPatients();
        },
        error: (err) => {
          this.hideLoader();
          console.error(err);
          alert('Error deleting patient.');
        }
      });
  }

  togglePatientStatus(id: string, action: 'activate' | 'deactivate') {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    this.showLoader();

   this.adminService.togglePatientStatus(id, action).subscribe({
        next: () => {
          this.hideLoader();
          alert(`Patient ${action}d successfully.`);
          this.fetchPatients();
        },
        error: (err) => {
          this.hideLoader();
          alert(`Error trying to ${action} account.`);
          console.error(err);
        }
      });
  }

  activatePatient(id: string) {
    if (confirm('Activate this account?')) {
      this.togglePatientStatus(id, 'activate');
    }
  }

  deactivatePatient(id: string) {
    if (confirm('Deactivate this account?')) {
      this.togglePatientStatus(id, 'deactivate');
    }
  }

  get paginatedPatients() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.filteredPatients.slice(start, start + this.rowsPerPage);
  }

  get pageCount() {
    return Math.ceil(this.filteredPatients.length / this.rowsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  searchPatients() {
    const q = this.searchQuery.toLowerCase();
    this.filteredPatients = this.allPatients.filter(p =>
      (p.name || '').toLowerCase().includes(q)
    );
    this.currentPage = 1;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  showLoader() {
    this.loaderVisible = true;
  }

  hideLoader() {
    this.loaderVisible = false;
  }
closeSidebar() {
  const sidebar = document.querySelector('.sidebar') as HTMLElement;
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

toggleSidebar() {
  const sidebar = document.querySelector('.sidebar') as HTMLElement;
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}


}
