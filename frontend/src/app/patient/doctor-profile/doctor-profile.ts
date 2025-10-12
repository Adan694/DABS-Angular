import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

dayjs.extend(relativeTime);

export interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  experience: number;
  degree: string;
  fees: number;
  about: string;
  photo: string;
  qualifications?: string;
  services?: string;
  conditions?: string;
  memberships?: string;
  locations?: string;
  availabilitySlots?: { date: string; slots: string[] }[];
  feedback?: Feedback[];
}

export interface Feedback {
  _id: string;
  patientId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.html',
  styleUrls: ['./doctor-profile.css'],
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer]
})
export class DoctorProfile implements OnInit {
  doctorId!: string | null;
  doctor!: Doctor;
  feedbackList: Feedback[] = [];
  isAvailable: boolean = false;
  loading: boolean = true;
  errorMessage: string = '';
  editingFeedbackId: string | null = null;
  editedRating: number = 0;
  editedComment: string = '';
  patientId = localStorage.getItem('patientId');
userRole = localStorage.getItem('userRole');

  

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
  this.doctorId = this.route.snapshot.paramMap.get('id');    if (!this.doctorId) {
      this.errorMessage = 'Invalid doctor ID';
      return;
    }

    this.fetchDoctor();
  }

 fetchDoctor(): void {
  this.loading = true;
  console.log('Fetching doctor with ID:', this.doctorId);

  this.http.get<Doctor>(`http://localhost:3000/doctor/${this.doctorId}`)
    .subscribe({
      next: (data) => {
        console.log('Doctor data received:', data);
        this.doctor = data;
        this.checkAvailability();
        this.feedbackList = data.feedback || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching doctor:', err);
        this.errorMessage = 'Failed to fetch doctor';
        this.loading = false;
      }
    });
}

  getInitials(name: string | undefined): string {
  if (!name) return 'A';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}


  checkAvailability(): void {
    if (!this.doctor.availabilitySlots) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todaySlot = this.doctor.availabilitySlots.find(slot => slot.date === todayStr);

    if (todaySlot) {
      this.isAvailable = todaySlot.slots.some(time => {
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

  startEditFeedback(feedback: Feedback): void {
    this.editingFeedbackId = feedback._id;
    this.editedRating = feedback.rating;
    this.editedComment = feedback.comment;
  }

  cancelEditFeedback(): void {
    this.editingFeedbackId = null;
  }

  submitEditedFeedback(feedbackId: string): void {
    const updatedFeedback = { rating: this.editedRating, comment: this.editedComment };
    const token = localStorage.getItem('authToken');

    this.http.put(`http://localhost:3000/api/feedback/${feedbackId}`, updatedFeedback, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.fetchDoctor();
        this.cancelEditFeedback();
      },
      error: (err) => console.error('Error updating feedback:', err)
    });
  }

  deleteFeedback(feedbackId: string): void {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    const token = localStorage.getItem('authToken');

    this.http.delete(`http://localhost:3000/api/feedback/${feedbackId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => this.fetchDoctor(),
      error: (err) => console.error('Error deleting feedback:', err)
    });
  }
}
