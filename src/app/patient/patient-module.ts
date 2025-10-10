import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AllDoctors } from './all-doctors/all-doctors';
import { ContactUs } from './contact-us/contact-us';
import { Dashboard } from './dashboard/dashboard';
import { DoctorProfile } from './doctor-profile/doctor-profile';
import { Faqs } from './faqs/faqs';
import { Feedback } from './feedback/feedback';
import { MyAppointments } from './my-appointments/my-appointments';
import { MyProfile } from './my-profile/my-profile';
  
export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'doctors', component: AllDoctors },
  { path: 'doctor/:id', component: DoctorProfile },
  { path: 'appointments', component: MyAppointments },
  { path: 'profile', component: MyProfile },
  { path: 'faqs', component: Faqs },
  { path: 'feedback', component: Feedback },
  { path: 'contactus', component: ContactUs },
   { path: 'all-doctors/:speciality', component: AllDoctors },
 { path: 'all-doctors', component: AllDoctors },
  { path: '', redirectTo: '/all-doctors', pathMatch: 'full' },
];

// @NgModule({
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
//     AllDoctors,
//     ContactUs,
//     Dashboard,
//     DoctorProfile,
//     Faqs,
//     Feedback,
//     MyAppointments,
//     MyProfile,
//   ]
// })
export class PatientModule {}
