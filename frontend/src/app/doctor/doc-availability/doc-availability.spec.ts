import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocAvailability } from './doc-availability';

describe('DocAvailability', () => {
  let component: DocAvailability;
  let fixture: ComponentFixture<DocAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
