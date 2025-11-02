import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocPanel } from './doc-panel/doc-panel';
import { DoctorAppointment } from './doc-appointment/doc-appointment';
import { DocAvailability } from './doc-availability/doc-availability';
import { DocFeedback } from './doc-feedback/doc-feedback';
import { DoctorProfile } from './doc-profile/doc-profile';
import { DoctorChat } from './doctorchat/doctorchat';
import { DoctorPatientChat } from './doctor-patient-chat/doctor-patient-chat';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DocPanel },
  { path: 'appointments', component: DoctorAppointment },
  { path: 'availability', component: DocAvailability },
  { path: 'feedback', component: DocFeedback },
  { path: 'profile', component: DoctorProfile },
  { path: 'doctor/chat', component: DoctorChat },
    {path: 'doctorpatient/chat', component: DoctorPatientChat }
];

