import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { DoctorService, Doctor } from '../../core/doctor';

@Component({
  selector: 'app-all-doctors',
  standalone: true,
  imports: [Navbar, Footer, FormsModule, CommonModule],
  templateUrl: './all-doctors.html',
  styleUrls: ['./all-doctors.css']
})
export class AllDoctors implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchQuery: string = '';
  specialityParam: string | null = null;
  loading: boolean = true;
  noDoctorsMessage: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
mockDoctors: Doctor[] = [
  {
    _id: '1',
    name: 'John Doe',
    speciality: 'Dermatologist',
    experience: 5,
    photo: 'd3.jpg', // put an image in assets folder
    averageRating: 4.5,
    availabilitySlots: [
      { date: '2025-10-08', slots: ['10:00 AM', '2:00 PM'] }
    ]
  },
  {
    _id: '2',
    name: 'Jane Smith',
    speciality: 'Cardiologist',
    experience: 8,
    photo: 'd4.jpg',
    averageRating: 4.8,
    availabilitySlots: [
      { date: '2025-10-08', slots: ['9:00 AM', '1:00 PM'] }
    ]
  },
  {
    _id: '3',
    name: 'Robert Brown',
    speciality: 'Dentist',
    experience: 3,
    photo: 'd5.jpg',
    averageRating: 4.2,
    availabilitySlots: [
      { date: '2025-10-08', slots: ['11:00 AM', '3:00 PM'] }
    ]
  }
];

 ngOnInit(): void {
  this.loading = true;

  // Simulate backend delay
  setTimeout(() => {
    this.doctors = this.mockDoctors;
    this.applySpecialityFilter();
    this.loading = false;
  }, 500); // half a second delay for testing
}


  applySpecialityFilter(): void {
    if (this.specialityParam) {
      this.filteredDoctors = this.doctors.filter(
        (d) => d.speciality.toLowerCase() === this.specialityParam
      );
    } else {
      this.filteredDoctors = [...this.doctors];
    }
    this.noDoctorsMessage = this.filteredDoctors.length === 0;
  }

  filterDoctors(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredDoctors = this.doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.speciality.toLowerCase().includes(query)
    );
    this.noDoctorsMessage = this.filteredDoctors.length === 0;
  }

  generateStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (halfStar) stars += '☆';
    stars = stars.padEnd(5, '☆');
    return stars;
  }

  isAvailable(doctor: Doctor): boolean {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todaySlot = doctor.availabilitySlots?.find((slot) => slot.date === todayStr);
    if (!todaySlot) return false;

    return todaySlot.slots.some((time) => {
      const [timeStr, modifier] = time.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const dateTime = new Date(todaySlot.date);
      dateTime.setHours(hours, minutes, 0, 0);
      return dateTime > now;
    });
  }

  goToSpeciality(speciality: string): void {
    // navigate with query params
    this.router.navigate([], { queryParams: { speciality } });
  }
}
