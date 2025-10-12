import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocPanel } from './doc-panel/doc-panel';
import { DocAppointment } from './doc-appointment/doc-appointment';
import { DocAvailability } from './doc-availability/doc-availability';
import { DocFeedback } from './doc-feedback/doc-feedback';
import { DocProfile } from './doc-profile/doc-profile';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
     DocPanel,
    DocAppointment,
    DocAvailability,
    DocFeedback,
    DocProfile
  ]
})
export class DoctorModule {}
