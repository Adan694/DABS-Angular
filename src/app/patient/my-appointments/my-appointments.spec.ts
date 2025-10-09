import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAppointments } from './my-appointments';

describe('MyAppointments', () => {
  let component: MyAppointments;
  let fixture: ComponentFixture<MyAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAppointments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAppointments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
