import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanel } from './admin-panel/admin-panel';
import { AddDoctor } from './add-doctor/add-doctor';
import { AdminDocList } from './admin-doc-list/admin-doc-list';
import { AdminAppointments } from './admin-appointments/admin-appointments';
import { PatientList } from './patient-list/patient-list';

const routes: Routes = [
  { path: '', component: AdminPanel },
  { path: 'add-doctor', component: AddDoctor},
  { path: 'doctors', component: AdminDocList },
  { path: 'appointments', component: AdminAppointments },
  { path: 'patients', component: PatientList },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
