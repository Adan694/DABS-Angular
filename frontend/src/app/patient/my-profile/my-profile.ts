import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule, RouterLink],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css'
})
export class MyProfile implements OnInit {
  profile: any = {};
  isEditing = false;
  loading = false;
  menuActive = false;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not logged in. Redirecting...');
      this.router.navigate(['/login']);
      return;
    }
    this.fetchProfile(token);
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  fetchProfile(token: string) {
    this.loading = true;
    this.http.get<any>('http://localhost:3000/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error fetching profile');
        this.loading = false;
      }
    });
  }

  editProfile() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  calculateAge() {
    if (this.profile.dob) {
      const dob = new Date(this.profile.dob);
      const diff = Date.now() - dob.getTime();
      const age = new Date(diff).getUTCFullYear() - 1970;
      this.profile.age = age;
    }
  }

  updateProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    this.loading = true;
    this.http.put('http://localhost:3000/user/update', this.profile, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        alert(res.message || 'Profile updated successfully');
        this.isEditing = false;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error updating profile');
        this.loading = false;
      }
    });
  }
}