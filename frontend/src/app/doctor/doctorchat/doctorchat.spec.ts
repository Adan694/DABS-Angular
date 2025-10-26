import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Doctorchat } from './doctorchat';

describe('Doctorchat', () => {
  let component: Doctorchat;
  let fixture: ComponentFixture<Doctorchat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Doctorchat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Doctorchat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
