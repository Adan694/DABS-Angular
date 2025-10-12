import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocPanel } from './doc-panel/doc-panel';
import { DocAppointment } from './doc-appointment/doc-appointment';
import { DocAvailability } from './doc-availability/doc-availability';
import { DocFeedback } from './doc-feedback/doc-feedback';
import { DocProfile } from './doc-profile/doc-profile';


const routes: Routes = [
  { path: '', component: DocPanel },
  { path: 'appointments', component: DocAppointment },
  { path: 'availability', component: DocAvailability  },
  { path: 'feedback', component: DocFeedback },
  { path: 'profile', component: DocProfile }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule {}
