import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDoctorChat } from './patient-doctor-chat';

describe('PatientDoctorChat', () => {
  let component: PatientDoctorChat;
  let fixture: ComponentFixture<PatientDoctorChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDoctorChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDoctorChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
