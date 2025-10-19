import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorNavbar } from '../../shared/doctor-navbar/doctor-navbar';
import { AppointmentService } from '../../services/appointment';

interface AvailabilitySlot {
  date: string;
  slots: string[];
}

@Component({
  selector: 'app-doc-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorNavbar],
  templateUrl: './doc-availability.html',
  styleUrls: ['./doc-availability.css']
})
export class DocAvailability implements OnInit {
  doctorId: string | null = null;
  availabilitySlots: AvailabilitySlot[] = [];
  loading = false;
  toastMessage = '';
  showQuickAdd = false;

  days = [
    { name: 'Monday', selected: false },
    { name: 'Tuesday', selected: false },
    { name: 'Wednesday', selected: false },
    { name: 'Thursday', selected: false },
    { name: 'Friday', selected: false },
    { name: 'Saturday', selected: false },
    { name: 'Sunday', selected: false }
  ];

  quickStart = '09:00';
  quickEnd = '17:00';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.doctorId = localStorage.getItem('doctorId');
    if (!this.doctorId) {
      alert('Doctor not logged in!');
      return;
    }
    this.loadAvailability();
  }

  // ✅ Load availability using AppointmentService
  loadAvailability() {
    if (!this.doctorId) return;
    this.loading = true;

    this.appointmentService.getDoctorAvailability(this.doctorId).subscribe({
      next: (res) => {
        this.availabilitySlots = res.availabilitySlots || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading availability:', err);
        this.loading = false;
      }
    });
  }

  // ✅ Add manual slot
  addSlot() {
    const today = new Date().toISOString().split('T')[0];
    this.availabilitySlots.push({ date: today, slots: ['09:00 AM', '10:00 AM'] });
  }

  removeSlot(index: number) {
    this.availabilitySlots.splice(index, 1);
  }

  openQuickAddPopup() {
    this.showQuickAdd = true;
  }

  closeQuickAddPopup() {
    this.showQuickAdd = false;
  }

  private getNextDateForDay(dayName: string): string {
    const dayOfWeekMap: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6
    };
    const targetDay = dayOfWeekMap[dayName];
    const today = new Date();
    const diff = (targetDay + 7 - today.getDay()) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return nextDate.toISOString().split('T')[0];
  }

  applyQuickAvailability() {
    const selectedDays = this.days.filter(d => d.selected).map(d => d.name);
    if (!selectedDays.length) {
      this.showToast('Please select at least one day');
      return;
    }

    const newSlot = `${this.formatTime(this.quickStart)} - ${this.formatTime(this.quickEnd)}`;
    selectedDays.forEach(day => {
      const date = this.getNextDateForDay(day);
      const existing = this.availabilitySlots.find(a => a.date === date);
      if (existing) {
        existing.slots.push(newSlot);
      } else {
        this.availabilitySlots.push({ date, slots: [newSlot] });
      }
    });

    this.showQuickAdd = false;
    this.showToast('Availability added successfully!');
  }

  private formatTime(time: string): string {
    const [hourStr, minuteStr] = (time || '00:00').split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const adjusted = hour % 12 || 12;
    return `${adjusted.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${suffix}`;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => (this.toastMessage = ''), 2500);
  }

  // ✅ Save using AppointmentService
  saveAvailability() {
  if (!this.doctorId) return;
  this.loading = true;

  this.appointmentService
    .updateDoctorAvailability(this.doctorId, this.availabilitySlots)
    .subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Availability saved successfully!');
      },
      error: (err) => {
        this.loading = false;
        console.error('Error saving availability:', err);
        this.showToast('Failed to save availability');
      }
    });
}
}
