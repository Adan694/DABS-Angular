import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../services/feedback';
import { ActivatedRoute, Router } from '@angular/router';
import { Footer } from '../../shared/footer/footer';
import { Navbar } from '../../shared/navbar/navbar';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer, HttpClientModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class Feedback implements OnInit {
  doctorId: string | null = null;
  appointmentId: string | null = null;
  doctorName = '';
  rating: string = '';
  comment: string = '';
  feedbackList: any[] = [];
  loading = false;
  showPopup = false;
  errorMessage = '';
  submitted = false;


  constructor(
    private feedbackService: FeedbackService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.doctorId = sessionStorage.getItem('feedbackDoctorId');
    this.appointmentId = sessionStorage.getItem('feedbackAppointmentId');

    if (!this.doctorId) {
      this.errorMessage = 'Invalid or missing doctor ID.';
      return;
    }

    this.fetchDoctorDetails();
  }

  fetchDoctorDetails(): void {
  this.feedbackService.getDoctorById(this.doctorId!).subscribe({
    next: (doctor) => {
      this.doctorName = doctor.name;
      this.loadFeedback();
      this.checkExistingFeedback(); 
    },
    error: (err) => {
      console.error('Doctor fetch failed:', err);
      this.errorMessage = 'Error fetching doctor details.';
    }
  });
}

  checkExistingFeedback(): void {
  if (!this.appointmentId) return;

  const storedFeedback = localStorage.getItem(`feedback_${this.appointmentId}`);
  if (storedFeedback) {
    this.feedbackList = [JSON.parse(storedFeedback)];
    this.submitted = true; // disables form
  }
}


getFeedbackForDoctor(doctorId: string): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/feedback?doctorId=${doctorId}`);
}



loadFeedback(): void {
  if (!this.doctorId) return;

  this.feedbackService.getFeedbackForDoctor(this.doctorId).subscribe({
    next: (feedbacks) => {
      console.log('Feedback received:', feedbacks);
      this.feedbackList = feedbacks;
    },
    error: (err) => {
      console.error('Error loading feedback:', err);
    }
  });
}

submitFeedback(): void {
  if (!this.appointmentId || !this.doctorId) {
    console.error('Missing appointmentId or doctorId');
    return;
  }

  const token = localStorage.getItem('authToken') || '';
  console.log('Sending feedback with token:', token);

  if (!token) {
    alert('You are not logged in. Please login first.');
    return;
  }

  const payload = {
    appointmentId: this.appointmentId,
    doctorId: this.doctorId,
    rating: this.rating,
    comment: this.comment
  };

  this.loading = true;

  this.feedbackService.submitFeedback(payload, token).subscribe({
    next: () => {
      this.loading = false;
      this.showPopup = true;
      this.submitted = true;
      this.feedbackList = [payload];

      localStorage.setItem(`feedback_${this.appointmentId}`, JSON.stringify(payload));

      console.log('Feedback successfully submitted and stored locally');
      this.loadFeedback();
    },
    error: (err) => {
      console.error('Feedback submit error:', err);
      alert('Error submitting feedback. Check console for details.');
      this.loading = false;
    }
    
  });

}

viewFeedback(): void {
  this.submitted = false;
  this.loadFeedback();
}


  closePopup(): void {
    this.showPopup = false;
    this.router.navigate(['/']);
  }
}

