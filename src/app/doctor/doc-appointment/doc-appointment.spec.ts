import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocAppointment } from './doc-appointment';

describe('DocAppointment', () => {
  let component: DocAppointment;
  let fixture: ComponentFixture<DocAppointment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocAppointment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocAppointment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
