import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AllDoctors } from './all-doctors/all-doctors';
import { ContactUs } from './contact-us/contact-us';
import { Dashboard } from './dashboard/dashboard';
import { DoctorProfile } from './doctor-profile/doctor-profile';
import { Faqs } from './faqs/faqs';
import { Feedback } from './feedback/feedback';
import { MyAppointments } from './my-appointments/my-appointments';
import { MyProfile } from './my-profile/my-profile';

@NgModule({
  declarations: [
    AllDoctors,
    ContactUs,
    Dashboard,
    DoctorProfile,
    Faqs,
    Feedback,
    MyAppointments,
    MyProfile,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class PatientModule {}
