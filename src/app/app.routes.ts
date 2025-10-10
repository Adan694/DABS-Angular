// import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './patient/dashboard/dashboard';
import { AllDoctors } from './patient/all-doctors/all-doctors';
import { ContactUs } from './patient/contact-us/contact-us';
import { Faqs } from './patient/faqs/faqs';

export const routes: Routes = [
   {
    path: 'patient',
    component: Dashboard  
  },
  { path: '', redirectTo: 'patient', pathMatch: 'full' },
  { path: 'all-doctors/:speciality', component: AllDoctors },
 { path: 'all-doctors', component: AllDoctors },
  { path: '', redirectTo: '/all-doctors', pathMatch: 'full' },
   { path: 'contactus', component: ContactUs },
  { path: 'faqs', component: Faqs },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-module').then(m => m.AdminModule)
  },
  {
    path: 'doctor',
    loadChildren: () =>
      import('./doctor/doctor-module').then(m => m.DoctorModule)
  },
  {
    path: 'patient',
    loadChildren: () =>
      import('./patient/patient-module').then(m => m.PatientModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./shared/shared-module').then(m => m.SharedModule)
  },
  { path: '**', redirectTo: '' }
];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
export class AppRoutingModule {}

