import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { forEachTrailingCommentRange } from 'typescript';
import { Footer } from '../../shared/footer/footer';

interface AvailabilitySlot {
  date: string;
  slots: string[];
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  styleUrls: ['./booking.css'],
  imports: [FormsModule, CommonModule, Navbar, Footer]
})
export class Booking implements OnInit {
  doctorId!: string | null;
  availabilitySlots: AvailabilitySlot[] = [];
  selectedDate: string = '';
  selectedTime: string = '';
  patientName: string = '';
  patientPhone: string = '';
  patientEmail: string = '';
  patientAge: number | null = null;
  patientIssue: string = '';
  loading: boolean = false;
  message: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.queryParamMap.get('doctorId');
    this.loadAvailability();
    this.loadPatientInfo();
  }

  loadPatientInfo() {
    this.patientName = localStorage.getItem('patientName') || '';
    this.patientPhone = localStorage.getItem('patientPhone') || '';
    this.patientEmail = localStorage.getItem('patientEmail') || '';
    this.patientAge = localStorage.getItem('patientAge') ? Number(localStorage.getItem('patientAge')) : null;
  }

  get selectedSlot(): AvailabilitySlot | undefined {
  return this.availabilitySlots.find(s => s.date === this.selectedDate);
  }

  loadAvailability() {
    if (!this.doctorId) return;

    this.http.get<any>(`http://localhost:3000/api/doctors/${this.doctorId}/availability`)
      .subscribe(data => {
        this.availabilitySlots = data.availabilitySlots || [];
        if (this.availabilitySlots.length > 0) {
          this.selectedDate = this.availabilitySlots[0].date;
        }
        console.log('Availability:', this.availabilitySlots);
      });
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.selectedTime = '';
  }

  selectTime(time: string) {
  this.selectedTime = time;
}

  showModal: boolean = false;
openModal() {
  if (!this.selectedDate || !this.selectedTime) return;
  this.message = ''; 
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
  }
  
  confirmBooking() {
    if (!this.selectedDate || !this.selectedTime || !this.patientName || !this.patientPhone || !this.patientEmail || !this.patientAge || !this.patientIssue) {
      this.message = 'Please fill all fields.';
      return;
    }

    this.loading = true;
    const payload = {
      patientId: localStorage.getItem('patientId'),
      doctorId: this.doctorId,
      date: this.selectedDate,
      time: this.selectedTime,
      name: this.patientName,
      phone: this.patientPhone,
      email: this.patientEmail,
      age: this.patientAge,
      issue: this.patientIssue
    };

    this.http.post('http://localhost:3000/api/appointments', payload)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.message = res.success ? `Appointment booked for ${this.selectedDate} at ${this.selectedTime}` : `Booking failed: ${res.message}`;
        },
        error: err => {
          this.loading = false;
          this.message = 'Network error: ' + err.message;
        }
      });
  }
}
