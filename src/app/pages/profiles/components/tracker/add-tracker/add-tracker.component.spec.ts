import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrackerComponent } from './add-tracker.component';

describe('AddTrackerComponent', () => {
  let component: AddTrackerComponent;
  let fixture: ComponentFixture<AddTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTrackerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
