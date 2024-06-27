import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreHireChecklistComponent } from './pre-hire-checklist.component';

describe('PreHireChecklistComponent', () => {
  let component: PreHireChecklistComponent;
  let fixture: ComponentFixture<PreHireChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreHireChecklistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreHireChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
