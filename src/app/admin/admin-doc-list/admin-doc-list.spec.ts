import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDocList } from './admin-doc-list';

describe('AdminDocList', () => {
  let component: AdminDocList;
  let fixture: ComponentFixture<AdminDocList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDocList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDocList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
