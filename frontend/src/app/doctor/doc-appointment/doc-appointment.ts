import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorNavbar } from '../../shared/doctor-navbar/doctor-navbar';
import { AppointmentService } from '../../services/appointment';
import { HttpHeaders } from '@angular/common/http';

interface Appointment {
  _id: string;
  patientName?: string;
  patientId?: { name?: string; phone?: string };
  date: string;
  time: string;
  status: string;
  feedback?: string;
  phone?: string;
}

interface AvailabilitySlot {
  date: string;
  slots: string[];
}

interface DoctorAvailabilityResponse {
  availabilitySlots: AvailabilitySlot[];
}

@Component({
  selector: 'app-doc-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorNavbar],
  templateUrl: './doc-appointment.html',
  styleUrls: ['./doc-appointment.css']
})
export class DoctorAppointment implements OnInit {
  doctorId: string | null = null;
  token: string | null = null;

  appointments: Appointment[] = [];
  searchText: string = '';

  upcomingAppointments: Appointment[] = [];
  cancelledAppointments: Appointment[] = [];
  missedAppointments: Appointment[] = [];
  completedAppointments: Appointment[] = [];

  pageSize = 6;
  currentPageUpcoming = 1;
  currentPageCancelled = 1;
  currentPageMissed = 1;
  currentPageCompleted = 1;

  showRescheduleModal = false;
  selectedAppointmentId: string = '';
  availableSlots: string[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.doctorId = localStorage.getItem('doctorId');
    this.token = localStorage.getItem('authToken');

    if (!this.doctorId || !this.token) {
      alert('Doctor not logged in!');
      return;
    }

    this.fetchAppointments();
  }
  tabs = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'missed', label: 'Missed' },
  { key: 'completed', label: 'Completed' },
];

activeTab: string = 'upcoming';

setActiveTab(tabKey: string) {
  this.activeTab = tabKey;
}


  get headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  //  Fetch appointments using the service
  fetchAppointments() {
    if (!this.doctorId) return;

    this.appointmentService.getDoctorAppointments(this.doctorId).subscribe({
      next: data => {
        console.log('Fetched appointments:', data);
        this.appointments = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.applyFilter();
      },
      error: err => console.error('Error fetching appointments', err)
    });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase();

    this.upcomingAppointments = this.appointments
      .filter(a => (a.patientName || a.patientId?.name || '').toLowerCase().includes(search) && a.status === 'pending');
    this.cancelledAppointments = this.appointments
      .filter(a => (a.patientName || a.patientId?.name || '').toLowerCase().includes(search) && a.status === 'Cancelled');
    this.missedAppointments = this.appointments
      .filter(a => (a.patientName || a.patientId?.name || '').toLowerCase().includes(search) && a.status === 'Missed');
    this.completedAppointments = this.appointments
      .filter(a => (a.patientName || a.patientId?.name || '').toLowerCase().includes(search) && a.status === 'Completed');

    this.currentPageUpcoming = 1;
    this.currentPageCancelled = 1;
    this.currentPageMissed = 1;
    this.currentPageCompleted = 1;
  }

  pagedAppointments(appointments: Appointment[], page: number) {
    const start = (page - 1) * this.pageSize;
    return appointments.slice(start, start + this.pageSize);
  }

  totalPages(appointments: Appointment[]) {
    return Math.ceil(appointments.length / this.pageSize);
  }

  nextPage(section: string) {
    switch (section) {
      case 'upcoming': if (this.currentPageUpcoming < this.totalPages(this.upcomingAppointments)) this.currentPageUpcoming++; break;
      case 'cancelled': if (this.currentPageCancelled < this.totalPages(this.cancelledAppointments)) this.currentPageCancelled++; break;
      case 'missed': if (this.currentPageMissed < this.totalPages(this.missedAppointments)) this.currentPageMissed++; break;
      case 'completed': if (this.currentPageCompleted < this.totalPages(this.completedAppointments)) this.currentPageCompleted++; break;
    }
  }

  prevPage(section: string) {
    switch (section) {
      case 'upcoming': if (this.currentPageUpcoming > 1) this.currentPageUpcoming--; break;
      case 'cancelled': if (this.currentPageCancelled > 1) this.currentPageCancelled--; break;
      case 'missed': if (this.currentPageMissed > 1) this.currentPageMissed--; break;
      case 'completed': if (this.currentPageCompleted > 1) this.currentPageCompleted--; break;
    }
  }

  // ✅ Mark appointment status via service
  markCompleted(appointmentId: string) {
    this.appointmentService.updateAppointmentStatus(appointmentId, 'Completed').subscribe(() => this.fetchAppointments());
  }

  markMissed(appointmentId: string) {
    this.appointmentService.updateAppointmentStatus(appointmentId, 'Missed').subscribe(() => this.fetchAppointments());
  }

  cancelAppointment(appointmentId: string) {
    this.appointmentService.cancelAppointmentByDoctor(appointmentId).subscribe(() => this.fetchAppointments());
  }

  // ✅ Rescheduling
  openRescheduleModal(appointmentId: string) {
    this.selectedAppointmentId = appointmentId;
    this.appointmentService.getDoctorAvailability(this.doctorId!)
  .subscribe({
    next: (data: DoctorAvailabilityResponse) => {
      (data.availabilitySlots || []).forEach((day: AvailabilitySlot) => {
        const dateStr = day.date.trim();
        day.slots.forEach((timeStr: string) =>
          this.availableSlots.push(`${dateStr}|${timeStr}`)
        );
      });
      this.showRescheduleModal = true;
    },
    error: err => console.error('Error fetching availability:', err)
  });

  }

  confirmReschedule(newSlot: string) {
    const [newDate, newTime] = newSlot.split('|');
    this.appointmentService.rescheduleAppointment(this.selectedAppointmentId, newDate, newTime)
      .subscribe(() => {
        this.showRescheduleModal = false;
        this.fetchAppointments();
      });
  }

  closeModal() {
    this.showRescheduleModal = false;
  }
}
