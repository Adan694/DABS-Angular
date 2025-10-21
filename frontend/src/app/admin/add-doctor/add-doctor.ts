import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-add-doctor',
  imports: [ReactiveFormsModule, RouterLink, AdminSidebar, CommonModule],
  templateUrl: './add-doctor.html',
  styleUrls: ['./add-doctor.css']
})
export class AddDoctor implements OnInit {
  doctorForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private adminService: AdminService) {}

  ngOnInit(): void {
    const bar = document.getElementById('bar');
  const sidebar = document.querySelector('app-admin-sidebar');
  const overlay = document.getElementById('overlay');

  if (bar && sidebar && overlay) {
    bar.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

    // ✅ Reactive form setup
    this.doctorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/)]
      ],
      speciality: ['', Validators.required],
      degree: ['', Validators.required],
      experience: ['', [Validators.required, Validators.pattern(/^\d+(\s?(year|years))?$/i)]],
      about: ['', [Validators.required, Validators.minLength(10)]],
      available: ['true', Validators.required],
      role: ['doctor']
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.doctorForm.value;
    formData.available = formData.available === 'true';

    this.adminService.addDoctor(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Doctor added successfully!';
        this.errorMessage = '';
        this.isSubmitting = false;
        this.doctorForm.reset();
      },
      error: (error) => {
        this.errorMessage = 'Failed to add doctor. Please check your inputs.';
        this.successMessage = '';
        this.isSubmitting = false;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    alert('You have been logged out successfully.');
    this.router.navigate(['/login']);
  }
}
