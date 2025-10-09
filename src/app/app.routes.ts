// // app.routes.ts
// import { Routes } from '@angular/router';
// import { AllDoctors } from './patient/all-doctors/all-doctors';
// export const routes: Routes = [
//   {
//     path: 'patient',
//     loadChildren: () =>
//       import('./patient/patient-routes').then(m => m.routes)
//   },
//     { path: 'all-doctors/:speciality', component: AllDoctors },
//    { path: 'all-doctors', component: AllDoctors },
//   { path: '', redirectTo: '/all-doctors', pathMatch: 'full' }
// ];
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'patient', pathMatch: 'full' },
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

