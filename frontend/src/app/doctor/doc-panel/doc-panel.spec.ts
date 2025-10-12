import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocPanel } from './doc-panel';

describe('DocPanel', () => {
  let component: DocPanel;
  let fixture: ComponentFixture<DocPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
