import { RouterModule, Routes } from '@angular/router';
import { AllDoctors } from './all-doctors/all-doctors';
import { DoctorProfile } from './doctor-profile/doctor-profile';
import { MyAppointments } from './my-appointments/my-appointments';
import { MyProfile } from './my-profile/my-profile';
import { Faqs } from './faqs/faqs';
import { Feedback } from './feedback/feedback';
import { Dashboard } from './dashboard/dashboard';
import { ContactUs } from './contact-us/contact-us';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'doctors', component: AllDoctors },
  { path: 'doctor/:id', component: DoctorProfile },
  { path: 'appointments', component: MyAppointments },
  { path: 'profile', component: MyProfile },
  { path: 'faqs', component: Faqs },
  { path: 'feedback', component: Feedback },
  { path: 'contactus', component: ContactUs },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
