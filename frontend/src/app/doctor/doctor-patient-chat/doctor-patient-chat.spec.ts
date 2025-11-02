import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPatientChat } from './doctor-patient-chat';

describe('DoctorPatientChat', () => {
  let component: DoctorPatientChat;
  let fixture: ComponentFixture<DoctorPatientChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPatientChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPatientChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
