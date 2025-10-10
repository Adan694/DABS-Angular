import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddDoctor } from './add-doctor/add-doctor';
import { AdminAppointments } from './admin-appointments/admin-appointments';
import { AdminDocList } from './admin-doc-list/admin-doc-list';
import { AdminFeedback } from './admin-feedback/admin-feedback';
import { AdminPanel } from './admin-panel/admin-panel';
import { PatientList } from './patient-list/patient-list';
import { PatientDetail } from './patient-detail/patient-detail';
import { DoctorAppointments } from './doctor-appointments/doctor-appointments';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AddDoctor,
    AdminAppointments,
    AdminDocList,
    AdminFeedback,
    AdminPanel,
    PatientList,
    PatientDetail,
    DoctorAppointments
  ]
})
export class AdminModule {}
