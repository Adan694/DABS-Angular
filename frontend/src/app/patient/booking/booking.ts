import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { forEachTrailingCommentRange } from 'typescript';
import { Footer } from '../../shared/footer/footer';
import { DoctorService } from '../../services/doctor';
import { HttpClient } from '@angular/common/http';


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
  showPopup: boolean = false;


constructor(
  private route: ActivatedRoute,
  private doctorService: DoctorService,
  private appointmentService: AppointmentService,
   private http: HttpClient
) {}


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
  if (!this.doctorId) {
    console.error(' No doctorId found in route.');
    return;
  }

  const url = `http://localhost:3000/api/doctors/${this.doctorId}/availability`;
  console.log(' Fetching availability from URL:', url);

  this.http.get<any>(url).subscribe(
    (data) => {
      console.log(' Raw API response:', data);

      if (!data) {
        console.warn(' No data returned from backend.');
      } else if (!data.availabilitySlots) {
        console.warn(' Response missing "availabilitySlots" field:', data);
      }

      this.availabilitySlots = data.availabilitySlots || [];
      if (this.availabilitySlots.length > 0) {
        this.selectedDate = this.availabilitySlots[0].date;
      }
      console.log(' Loaded availability slots:', this.availabilitySlots);
    },
    (err) => {
      console.error(' Error loading availability:', err);
      console.error(' Request URL that failed:', url);
    }
  );
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
  const patientId = localStorage.getItem('patientId');
  const token = localStorage.getItem('authToken');

  // 🧩 1️⃣ Not logged in check
  if (!patientId || !token) {
    this.showPopupMessage('⚠️ You are not logged in. Redirecting to login page...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return;
  }

  // 🧩 2️⃣ Validate inputs
  if (
    !this.selectedDate ||
    !this.selectedTime ||
    !this.patientName ||
    !this.patientPhone ||
    !this.patientEmail ||
    !this.patientAge ||
    !this.patientIssue
  ) {
    this.showPopupMessage('❗ Please fill all required fields.');
    return;
  }

  this.loading = true; // ⏳ Show loading on button

  // 🧩 3️⃣ Check existing appointments first
  this.appointmentService.getAppointments(patientId).subscribe({
    next: (appointments) => {
      const conflict = appointments.some(
        (a: any) =>
          a.date === this.selectedDate &&
          a.time === this.selectedTime &&
          a.status !== 'cancelled'
      );

      if (conflict) {
        this.loading = false;
        this.showPopupMessage('⚠️ You already have an appointment at this time.');
        return;
      }

      // 🧩 4️⃣ No conflict → proceed with booking
      const payload = {
        patientId,
        doctorId: this.doctorId,
        date: this.selectedDate,
        time: this.selectedTime,
        name: this.patientName,
        phone: this.patientPhone,
        email: this.patientEmail,
        age: this.patientAge,
        issue: this.patientIssue,
      };

      this.appointmentService.createAppointment(payload).subscribe({
        next: (res: any) => {
          this.loading = false;

          if (res.success) {
            // ✅ Close modal before showing popup
            this.showModal = false;

            // ✅ Reset form fields (optional)
            this.selectedTime = '';
            this.patientIssue = '';

            // ✅ Show success message
            this.showPopupMessage(`✅ Appointment booked for ${this.selectedDate} at ${this.selectedTime}.`);
          } else {
            this.showPopupMessage(`❌ Booking failed: ${res.message}`);
          }
        },
        error: (err) => {
          this.loading = false;
          this.showPopupMessage('❌ Network error: ' + err.message);
        },
      });
    },
    error: (err) => {
      this.loading = false;
      this.showPopupMessage('❌ Could not verify existing appointments.');
      console.error(err);
    },
  });
}


// ✅ Helper to handle popup messages
showPopupMessage(msg: string) {
  this.message = msg;
  this.showPopup = true;
  setTimeout(() => {
    this.showPopup = false;
  }, 2500);

  }
}
