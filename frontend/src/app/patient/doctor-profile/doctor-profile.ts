import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { DoctorService } from '../../services/doctor';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.html',
  styleUrls: ['./doctor-profile.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer]
})
export class DoctorProfile implements OnInit {
  doctorId!: string | null;
  doctor: any;
  feedbackList: any[] = [];
  isAvailable = false;
  loading = true;
  errorMessage = '';
  editingFeedbackId: string | null = null;
  editedRating = 0;
  editedComment = '';
  patientId = localStorage.getItem('patientId');
  userRole = localStorage.getItem('userRole');

  constructor(private route: ActivatedRoute, private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.paramMap.get('id');
    if (!this.doctorId) {
      this.errorMessage = 'Invalid doctor ID';
      return;
    }
    this.fetchDoctor();
  }

  fetchDoctor(): void {
    this.loading = true;
    console.log('📡 Fetching doctor with ID:', this.doctorId);

    this.doctorService.getDoctorById(this.doctorId!).subscribe({
      next: (data) => {
        console.log('✅ Doctor data received:', data);
        this.doctor = data;
        this.feedbackList = data.feedback || [];
        this.checkAvailability();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching doctor:', err);
        this.errorMessage = 'Failed to fetch doctor';
        this.loading = false;
      }
    });
  }

  // ✅ Add this helper back
  getInitials(name: string | undefined): string {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  checkAvailability(): void {
    if (!this.doctor?.availabilitySlots) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todaySlot = this.doctor.availabilitySlots.find((slot: any) => slot.date === todayStr);

    if (todaySlot) {
      this.isAvailable = todaySlot.slots.some((time: string) => {
        const [timeStr, modifier] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const dateTime = new Date(todaySlot.date);
        dateTime.setHours(hours, minutes, 0, 0);
        return dateTime > now;
      });
    }
  }

  formatDateFromNow(timestamp: string): string {
    return dayjs(timestamp).fromNow();
  }

  startEditFeedback(feedback: any): void {
    this.editingFeedbackId = feedback._id;
    this.editedRating = feedback.rating;
    this.editedComment = feedback.comment;
  }

  cancelEditFeedback(): void {
    this.editingFeedbackId = null;
  }

  submitEditedFeedback(feedbackId: string): void {
    const token = localStorage.getItem('authToken') || '';
    const updatedFeedback = { rating: this.editedRating, comment: this.editedComment };

    this.doctorService.updateFeedback(feedbackId, updatedFeedback, token).subscribe({
      next: () => {
        console.log('✅ Feedback updated');
        this.fetchDoctor();
        this.cancelEditFeedback();
      },
      error: (err) => console.error('❌ Error updating feedback:', err)
    });
  }

  deleteFeedback(feedbackId: string): void {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    const token = localStorage.getItem('authToken') || '';

    this.doctorService.deleteFeedback(feedbackId, token).subscribe({
      next: () => {
        console.log('🗑️ Feedback deleted');
        this.fetchDoctor();
      },
      error: (err) => console.error('❌ Error deleting feedback:', err)
    });
  }
}
