import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin';

declare const Chart: any;

@Component({
  selector: 'app-admin-appointments',
  imports: [AdminSidebar, CommonModule, DatePipe],
  templateUrl: './admin-appointments.html',
  styleUrls: ['./admin-appointments.css']
})
export class AdminAppointments implements OnInit {
  Math = Math;

  upcomingAppointments: any[] = [];
  completedAppointments: any[] = [];
  missedAppointments: any[] = [];
  availableSlots: string[] = [];
  currentPage = { upcoming: 1, completed: 1, missed: 1 };
  itemsPerPage = 5;

  constructor(private http: HttpClient, private router: Router, private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchAppointments();
  const bar = document.getElementById('bar');
  const sidebar = document.querySelector('app-admin-sidebar');
  const overlay = document.getElementById('overlay');

  if (bar && sidebar && overlay) {
    bar.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
  }
   logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    alert('You have been logged out successfully.');
     this.router.navigate(['/login']);
  }

  activeTab: 'upcoming' | 'completed' | 'missed' = 'upcoming';

setActiveTab(tab: 'upcoming' | 'completed' | 'missed') {
  this.activeTab = tab;
}



  // Fetch all appointments from backend
  fetchAppointments() {
   this.adminService.getAllAppointments().subscribe({
    next: (response) => {

          // Separate appointments by status
          this.upcomingAppointments = response.filter((a: any) => a.status === 'pending');
          this.completedAppointments = response.filter((a: any) => a.status === 'Completed');
          this.missedAppointments = response.filter((a: any) => a.status === 'missed' || a.status === 'cancelled');

          const allAppointments = [...this.upcomingAppointments, ...this.completedAppointments, ...this.missedAppointments];

        allAppointments.forEach(appt => {
          if (appt.doctorId && typeof appt.doctorId === 'string') {
                     this.adminService.getDoctorById(appt.doctorId).subscribe({
                next: (doctor) => {
                  appt.doctorName = doctor.name;
                },
                error: (err) => console.error('Error fetching doctor data:', err)
              });
          }
        });
          // Initial render
          this.renderTable('upcoming');
          this.renderTable('completed');
          this.renderTable('missed');
        },
        error: (err) => {
          console.error('Error fetching appointments:', err);
        }
      });
  }

  // Pagination: render table for a specific type
  renderTable(type: 'upcoming' | 'completed' | 'missed') {
    let list: any[] = [];
    if (type === 'upcoming') list = this.upcomingAppointments;
    if (type === 'completed') list = this.completedAppointments;
    if (type === 'missed') list = this.missedAppointments;

    const start = (this.currentPage[type] - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const paginated = list.slice(start, end);

    console.log(`Rendering ${type} table page ${this.currentPage[type]}:`, paginated);
  }

  nextPage(type: 'upcoming' | 'completed' | 'missed') {
    const list = this.getList(type);
    const totalPages = Math.ceil(list.length / this.itemsPerPage);
    if (this.currentPage[type] < totalPages) {
      this.currentPage[type]++;
      this.renderTable(type);
    }
  }

  prevPage(type: 'upcoming' | 'completed' | 'missed') {
    if (this.currentPage[type] > 1) {
      this.currentPage[type]--;
      this.renderTable(type);
    }
  }

  getList(type: 'upcoming' | 'completed' | 'missed') {
    if (type === 'upcoming') return this.upcomingAppointments;
    if (type === 'completed') return this.completedAppointments;
    return this.missedAppointments;
  }

  get paginatedUpcoming() {
    const start = (this.currentPage.upcoming - 1) * this.itemsPerPage;
    return this.upcomingAppointments.slice(start, start + this.itemsPerPage);
  }

  get paginatedCompleted() {
    const start = (this.currentPage.completed - 1) * this.itemsPerPage;
    return this.completedAppointments.slice(start, start + this.itemsPerPage);
  }

  get paginatedMissed() {
    const start = (this.currentPage.missed - 1) * this.itemsPerPage;
    return this.missedAppointments.slice(start, start + this.itemsPerPage);
  }

  // Open reschedule modal and load available slots
  openRescheduleModal(appointmentId: string, doctorId: string) {
      this.adminService.getDoctorAvailability(doctorId).subscribe({
        next: (data) => {
          this.availableSlots = [];
          (data.availabilitySlots || []).forEach((day: any) => {
            const dateStr = (day.date || '').trim();
            (day.slots || []).forEach((timeStr: string) => {
              this.availableSlots.push(`${dateStr}|${timeStr}`);
            });
          });

          const modal = document.getElementById('rescheduleModal');
          if (modal) modal.classList.add('active');
        },
        error: (err) => {
          console.error('Error fetching availability:', err);
        }
      });
  }

  confirmReschedule() {
    const appointmentId = (document.getElementById('appointmentId') as HTMLInputElement)?.value;
    const selectedSlot = (document.getElementById('availableSlots') as HTMLSelectElement)?.value;
    if (!appointmentId || !selectedSlot) {
      alert('Please select a slot');
      return;
    }

    const [date, time] = selectedSlot.split('|');
      this.adminService.rescheduleAppointment(appointmentId, date, time).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccessPopup();
          this.fetchAppointments();
        },
        error: (err) => console.error('Error rescheduling appointment:', err)
      });
  }

  // Modal controls
  closeModal() {
    const modal = document.getElementById('rescheduleModal');
    if (modal) modal.classList.remove('active');
  }

  showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) popup.classList.add('active');
  }

  closeSuccessPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) popup.classList.remove('active');
  }
}
