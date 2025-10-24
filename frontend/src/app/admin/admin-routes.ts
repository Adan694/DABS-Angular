import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminPanel } from './admin-panel/admin-panel';
import { AdminAppointments } from './admin-appointments/admin-appointments';
import { AddDoctor } from './add-doctor/add-doctor';
import { AdminFeedback } from './admin-feedback/admin-feedback';
import { PatientsList } from './patient-list/patient-list';
import { PatientDetail } from './patient-detail/patient-detail';
import { AdminDocList } from './admin-doc-list/admin-doc-list';
import { AdminChat } from './chat/chat';
export const routes: Routes = [
  { path: '', component: AdminPanel }, 
  { path: 'appointments', component: AdminAppointments },
  { path: 'adddoctors', component: AddDoctor },
  { path: 'feedback', component: AdminFeedback },
  { path: 'patient-list', component: PatientsList },
  { path: 'patient-details', component: PatientDetail },
  { path: 'doclist', component: AdminDocList },
  { path: 'chat', component: AdminChat}

];
