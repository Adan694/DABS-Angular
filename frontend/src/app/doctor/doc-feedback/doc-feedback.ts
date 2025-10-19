import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback';
import { DoctorNavbar } from '../../shared/doctor-navbar/doctor-navbar';

@Component({
  selector: 'app-doc-feedback',
  standalone: true,
  imports: [CommonModule, DoctorNavbar],
  templateUrl: './doc-feedback.html',
  styleUrls: ['./doc-feedback.css']
})
export class DocFeedback implements OnInit {
  doctorId: string | null = null;
  token: string | null = null;
  feedbacks: any[] = [];
  doctorFeedbacks: any[] = [];
  loading = false;
  avgStars = '';
  sortOrder = 'dateDesc';

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit() {
    this.doctorId = localStorage.getItem('doctorId');
    this.token = localStorage.getItem('authToken');

    if (!this.doctorId || !this.token) {
      window.location.href = '/login';
      return;
    }

    this.loadDoctorFeedback();
  }

  // ✅ Load doctor feedback using the service
  loadDoctorFeedback() {
    if (!this.doctorId) return;

    this.loading = true;
    this.feedbackService.getFeedbackForDoctor(this.doctorId).subscribe({
      next: (data) => {
        this.feedbacks = data;
        this.doctorFeedbacks = [...data];
        this.loading = false;
        this.renderFeedbackTable();
      },
      error: (err) => {
        console.error('Error loading feedback:', err);
        this.loading = false;

        // Optional: helpful debug info
        if (err.status === 404) {
          console.error('No feedback route found — check backend route or doctorId.');
        } else if (err.status === 401) {
          console.error('Unauthorized — invalid or missing token.');
        }
      }
    });
  }

  // ✅ Calculate average rating and star icons
  renderFeedbackTable() {
    if (!this.feedbacks.length) {
      this.avgStars = '';
      return;
    }

    const avgRating =
      this.feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / this.feedbacks.length;
    this.avgStars =
      '★'.repeat(Math.round(avgRating)) +
      '☆'.repeat(5 - Math.round(avgRating));
  }

  // ✅ Sorting logic for date or rating
  sortFeedback(event: any) {
    const value = event.target.value;
    let sorted = [...this.doctorFeedbacks];

    if (value === 'dateDesc')
      sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (value === 'dateAsc')
      sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (value === 'ratingDesc') sorted.sort((a, b) => b.rating - a.rating);
    if (value === 'ratingAsc') sorted.sort((a, b) => a.rating - b.rating);

    this.feedbacks = sorted;
    this.renderFeedbackTable();
  }
}
