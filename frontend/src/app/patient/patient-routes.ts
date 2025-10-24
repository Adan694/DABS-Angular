import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { AllDoctors } from './all-doctors/all-doctors';
import { DoctorProfile } from './doctor-profile/doctor-profile';
import { ContactUs } from './contact-us/contact-us';
import { Faqs } from './faqs/faqs';
import { Feedback } from './feedback/feedback';
import { MyAppointments } from './my-appointments/my-appointments';
import { MyProfile } from './my-profile/my-profile';
import { Booking } from './booking/booking';
import { Chat } from './chat/chat';

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
  { path: 'booking', component: Booking },
  { path: 'chat', component: Chat },

];
