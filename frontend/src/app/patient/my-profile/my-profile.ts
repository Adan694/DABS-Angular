import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SocketService } from '../../services/socket';
import { Subscription } from 'rxjs';

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
  unreadCount = 0; 
  private msgSub?: Subscription;
  currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';
  constructor(private http: HttpClient, private router: Router,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not logged in. Redirecting...');
      this.router.navigate(['/login']);
      return;
    }
    this.fetchProfile(token);
        this.setupSocketListeners();

  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }
   ngOnDestroy() {
    this.msgSub?.unsubscribe();
  }

  setupSocketListeners() {
    this.socketService.connect();

    this.msgSub = this.socketService.onMessage().subscribe((msg: any) => {
      if (msg.receiverId === this.currentUserId) {
        this.unreadCount++;
        localStorage.setItem('patientUnreadCount', this.unreadCount.toString());
      }
    });

    // restore from storage (optional)
    const saved = localStorage.getItem('patientUnreadCount');
    if (saved) this.unreadCount = parseInt(saved);
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

   goToChat() {
    this.unreadCount = 0;
    localStorage.removeItem('patientUnreadCount');
    this.router.navigate(['/patient/chat']);
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