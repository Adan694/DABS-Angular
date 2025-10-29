import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket'; // adjust path as needed

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  isSignup = false;

  loginData = { role: '', email: '', password: '' };
  signupData = { name: '', phone: '', cnic: '', email: '', password: '', confirmPassword: '', role: 'patient' };
  errors: any = {};

  constructor(private router: Router,  private socketService: SocketService,) {}

  // LOGIN
  async onLogin() {
  this.errors = {};

  // Basic frontend validation
  if (!this.validateEmail(this.loginData.email)) {
    this.errors.email = 'Invalid email';
    return;
  }
  if (this.loginData.password.length < 6) {
    this.errors.password = 'Password must be at least 6 characters';
    return;
  }
  if (!this.loginData.role) {
    this.loginData.role = 'patient';
  }

  try {
    console.log('Sending login data:', this.loginData);

    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.loginData)
    });

    const data = await res.json();
    console.log('Backend response:', data);

    if (res.status !== 200) {
      alert(data.error || data.message || 'Login failed');
      return;
    }

    // ✅ Store everything in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('user', JSON.stringify(data.user)); // 👈 save complete user details
this.socketService.connect(); // show online immediately
    // ✅ Optionally, also store ID separately for quick access
    if (data.user?._id) {
      if (data.role === 'doctor') {
        localStorage.setItem('doctorId', data.user._id);
      } else if (data.role === 'patient') {
        localStorage.setItem('patientId', data.user._id);
      }
    }

    console.log('✅ Saved user in localStorage:', data.user);

    // ✅ Role-based redirection
    if (data.role === 'admin') this.router.navigate(['/admin']);
    else if (data.role === 'doctor') this.router.navigate(['/doctor']);
    else this.router.navigate(['/patient']);

  } catch (err) {
    console.error(err);
    alert('Login failed. Please check your backend and network.');
  }
}

  // SIGNUP
  async onSignup() {
    this.errors = {};

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errors.confirm = 'Passwords do not match';
      return;
    }

    try {
      console.log('Sending signup data:', this.signupData); // Debug payload
      const res = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.signupData)
      });

      const data = await res.json();
      console.log('Backend response:', data);

      if (res.status !== 200) {
        alert(data.error || 'Signup failed');
        return;
      }

      alert('Signup successful! Please login.');
      this.isSignup = false;

    } catch (err) {
      console.error(err);
      alert('Signup failed. Please check your backend and network.');
    }
  }

  // EMAIL VALIDATOR
  validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
