import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

export interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  experience: number;
  photo: string;
  averageRating: number;
  availabilitySlots?: { date: string; slots: string[] }[];
}

@Component({
  selector: 'app-all-doctors',
  standalone: true,
  imports: [Navbar, Footer, FormsModule, CommonModule, RouterLink, HttpClientModule],
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
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.specialityParam = this.route.snapshot.queryParamMap.get('speciality');

    // Fetch doctors from backend
    this.http.get<Doctor[]>('http://localhost:3000/doctor')
      .subscribe({
        next: (data) => {
          this.doctors = data;
          this.applySpecialityFilter();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching doctors:', err);
          this.loading = false;
          this.noDoctorsMessage = true;
        }
      });
  }

  // Filter by speciality from query param
  applySpecialityFilter(): void {
    if (this.specialityParam) {
      this.filteredDoctors = this.doctors.filter(
        (d) => d.speciality.toLowerCase() === this.specialityParam?.toLowerCase()
      );
    } else {
      this.filteredDoctors = [...this.doctors];
    }
    this.noDoctorsMessage = this.filteredDoctors.length === 0;
  }

  // Search doctors by name or speciality
  filterDoctors(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredDoctors = this.doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.speciality.toLowerCase().includes(query)
    );
    this.noDoctorsMessage = this.filteredDoctors.length === 0;
  }
getDoctorImageUrl(doctor: Doctor): string {
  return `http://localhost:3000/uploads/${doctor.photo}`;
}

  // Generate star rating
  generateStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (halfStar) stars += '☆';
    stars = stars.padEnd(5, '☆');
    return stars;
  }

  // Check if doctor has available slots today
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

  // Filter by speciality when clicked
  goToSpeciality(speciality: string): void {
    this.router.navigate([], { queryParams: { speciality } });
  }
}
