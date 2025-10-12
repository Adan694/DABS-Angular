import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocFeedback } from './doc-feedback';

describe('DocFeedback', () => {
  let component: DocFeedback;
  let fixture: ComponentFixture<DocFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocFeedback]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocFeedback);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
