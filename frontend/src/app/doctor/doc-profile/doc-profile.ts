import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DoctorNavbar } from '../../shared/doctor-navbar/doctor-navbar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../services/doctor';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorNavbar],
  templateUrl: './doc-profile.html',
  styleUrls: ['./doc-profile.css']
})
export class DoctorProfile implements OnInit {
  doctorId = localStorage.getItem('doctorId');
  isEditing = false;
  isLoading = false;
  toastMessage = '';
  showPasswordFields = false;

constructor(private http: HttpClient, private doctorService: DoctorService) {}

  ngOnInit() {
    this.loadDoctorProfile();
  }

  switchTab(tabId: string) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent?.toLowerCase().includes(tabId));
    if (btn) btn.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  }

  validateExperience(): boolean {
    const value = parseInt((<HTMLInputElement>document.getElementById('experience')).value, 10);
    const error = document.getElementById('experienceError')!;
    if (isNaN(value) || value <= 0) {
      error.textContent = 'Experience must be greater than 0.';
      error.style.display = 'block';
      return false;
    }
    error.style.display = 'none';
    return true;
  }

  validateFees(): boolean {
    const value = parseInt((<HTMLInputElement>document.getElementById('fees')).value, 10);
    const error = document.getElementById('feesError')!;
    if (isNaN(value) || value <= 0) {
      error.textContent = 'Fees must be greater than 0.';
      error.style.display = 'block';
      return false;
    }
    error.style.display = 'none';
    return true;
  }

  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;
  }

  previewImage(event: any) {
    const file = event.target.files[0];
    const img = document.getElementById('profilePic') as HTMLImageElement;
    if (file) img.src = URL.createObjectURL(file);
  }

  enableEditing() {
    this.isEditing = true;
    const btn = document.querySelector('.action-buttons .btn') as HTMLButtonElement;
    btn.textContent = 'Save Profile';
  }

  loadDoctorProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not logged in.');
      return;
    }

     this.doctorService.getDoctorById(this.doctorId!).subscribe({
    next: (data) => {
          (<HTMLInputElement>document.getElementById('doctorName')).value = data.name || '';
          (<HTMLSelectElement>document.getElementById('specialization')).value = data.speciality || '';
          (<HTMLInputElement>document.getElementById('qualifications')).value = data.qualifications || '';
          (<HTMLInputElement>document.getElementById('services')).value = data.services || '';
          (<HTMLInputElement>document.getElementById('conditions')).value = data.conditions || '';
          (<HTMLInputElement>document.getElementById('experience')).value = data.experience || '';
          (<HTMLInputElement>document.getElementById('memberships')).value = data.memberships || '';
          (<HTMLInputElement>document.getElementById('fees')).value = data.fees || '';
          (<HTMLInputElement>document.getElementById('locations')).value = data.locations || '';
          (<HTMLInputElement>document.getElementById('degree')).value = data.degree || '';
          (<HTMLTextAreaElement>document.getElementById('about')).value = data.about || '';
          const profilePic = document.getElementById('profilePic') as HTMLImageElement;
          profilePic.src = data.photo
            ? `http://localhost:3000/uploads/${data.photo}`
            : 'assets/images/placeholder.png';
        },
        error: (err) => console.error('Failed to load profile', err)
      });
  }

  saveProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) return alert('You are not logged in.');

    const validExp = this.validateExperience();
    const validFees = this.validateFees();
    if (!validExp || !validFees) return alert('Please fix errors before saving.');

    const fileInput = <HTMLInputElement>document.getElementById('fileUpload');
    const file = fileInput.files?.[0];
    const formData = new FormData();

    formData.append('name', (<HTMLInputElement>document.getElementById('doctorName')).value);
    formData.append('speciality', (<HTMLSelectElement>document.getElementById('specialization')).value);
    formData.append('qualifications', (<HTMLInputElement>document.getElementById('qualifications')).value);
    formData.append('services', (<HTMLInputElement>document.getElementById('services')).value);
    formData.append('conditions', (<HTMLInputElement>document.getElementById('conditions')).value);
    formData.append('experience', (<HTMLInputElement>document.getElementById('experience')).value);
    formData.append('memberships', (<HTMLInputElement>document.getElementById('memberships')).value);
    formData.append('fees', (<HTMLInputElement>document.getElementById('fees')).value);
    formData.append('locations', (<HTMLInputElement>document.getElementById('locations')).value);
    formData.append('degree', (<HTMLInputElement>document.getElementById('degree')).value);
    formData.append('about', (<HTMLTextAreaElement>document.getElementById('about')).value);
    if (file) formData.append('photo', file);

    this.isLoading = true;

  this.doctorService.updateDoctorProfile(this.doctorId!, formData, token).subscribe({
  next: (res) => {
    this.isLoading = false;
    this.showToast('Profile saved successfully!');
    this.isEditing = false;
  },
  error: (err) => {
    this.isLoading = false;
    this.showToast('Error saving profile');
    console.error('Error saving profile:', err);
  }
});

  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
