import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.css'
})
export class MyAppointments implements OnInit {
  allAppointments: any[] = [];
  paginatedAppointments: any[] = [];
  activeTab: string = 'upcoming';
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  loading = false;

  popupAppointment: any = null;
  showPopup = false;
  cancelModal = false;
  successModal = false;
  cancelId: string = '';
  menuActive = false;

  feedbackPopup = false;
  selectedFeedback: any = null;

  constructor(private router: Router, private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.fetchAppointments();
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  fetchAppointments() {
  this.loading = true;
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    console.error('❌ No patientId found in localStorage.');
    this.loading = false;
    return;
  }

  // 1️⃣ Fetch appointments first
  this.appointmentService.getAppointments(patientId).subscribe({
    next: (appointments) => {
      // 2️⃣ Then fetch all feedbacks given by this patient
      this.appointmentService.getFeedbacksByPatient(patientId).subscribe({
        next: (feedbacks) => {
          // 3️⃣ Map feedbacks to their corresponding appointments
          appointments.forEach(a => {
            const fb = feedbacks.find(f => f.appointmentId === a._id);
            if (fb) {
              a.feedback = fb.comment || fb.feedback || '';
              a.feedbackDate = fb.date || fb.createdAt || null;
              a.hasFeedback = true;
            } else {
              a.hasFeedback = false;
            }
          });

          // 4️⃣ Save and render
          this.allAppointments = appointments;
          this.renderAppointments('upcoming');
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error fetching feedbacks:', err);
          this.allAppointments = appointments;
          this.renderAppointments('upcoming');
          this.loading = false;
        }
      });
    },
    error: (err) => {
      console.error('❌ Error fetching appointments:', err);
      this.loading = false;
    }
  });
}


  renderAppointments(type: string) {
    const now = new Date();
    const filtered = this.allAppointments.filter(a => {
      const date = new Date(a.date);
      if (type === 'upcoming') return date >= now && a.status !== 'cancelled';
      if (type === 'past') return date < now;
      return true;
    });

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedAppointments = filtered.slice(start, start + this.pageSize);
  }

  showAppointments(type: string) {
    this.activeTab = type;
    this.currentPage = 1;
    this.renderAppointments(type);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderAppointments(this.activeTab);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderAppointments(this.activeTab);
    }
  }

  viewAppointment(id: string) {
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (res) => {
        this.popupAppointment = res;
        this.showPopup = true;
      },
      error: (err) => console.error(err)
    });
  }

  closePopup() {
    this.showPopup = false;
  }

  cancelAppointment(id: string) {
    this.cancelId = id;
    this.cancelModal = true;
  }

  confirmCancel() {
    this.cancelModal = false;
    this.loading = true;

    this.appointmentService.cancelAppointment(this.cancelId).subscribe({
      next: () => {
        this.loading = false;
        this.successModal = true;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  closeSuccess() {
    this.successModal = false;
    this.fetchAppointments();
  }

  giveFeedback(a: any) {
    sessionStorage.setItem('feedbackDoctorId', a.doctorId?._id);
    sessionStorage.setItem('feedbackDoctorName', a.doctorId?.name);
    sessionStorage.setItem('feedbackAppointmentId', a._id);
    this.router.navigate(['/patient/feedback']);
  }

feedbackGiven(appointmentId: string): boolean {
  const feedbackGiven = JSON.parse(localStorage.getItem('feedbackGiven') || '[]');
  console.log('Feedback stored in localStorage:', feedbackGiven);
  return feedbackGiven.includes(appointmentId);
}



  viewFeedback(a: any) {
    this.selectedFeedback = {
      doctor: a.doctorId?.name,
      feedback: a.feedback || 'No feedback text available.',
      date: a.feedbackDate ? new Date(a.feedbackDate).toLocaleDateString() : 'Unknown date'
    };
    this.feedbackPopup = true;
  }

  closeFeedbackPopup() {
    this.feedbackPopup = false;
  }

  canGiveFeedback(a: any): boolean {
  return (
    a.status?.toLowerCase() === 'completed' && 
    !a.hasFeedback
  );
}

canViewFeedback(a: any): boolean {
  return (
    a.status?.toLowerCase() === 'completed' && 
    a.hasFeedback
  );
}

}
