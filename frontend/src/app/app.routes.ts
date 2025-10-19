import { Routes } from '@angular/router';
import { Login } from './shared/login/login';
import { Dashboard } from './patient/dashboard/dashboard';


export const routes: Routes = [
  {
    path: 'patient',
    loadChildren: () =>
      import('./patient/patient-routes').then(m => m.routes)
  },
  { path: 'login', component: Login },
  { path: '', component: Dashboard },
     {
    path: 'doctor',
    loadChildren: () =>
      import('./doctor/doctor-routes').then(m => m.routes)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-routes').then(m => m.routes)
  },


];
