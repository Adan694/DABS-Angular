import { Routes } from '@angular/router';
import { Login } from './shared/login/login';


export const routes: Routes = [
  {
    path: 'patient',
    loadChildren: () =>
      import('./patient/patient-routes').then(m => m.routes)
  },
    { path: 'login', component: Login },

];
