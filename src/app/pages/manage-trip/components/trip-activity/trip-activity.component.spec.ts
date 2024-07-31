import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripActivityComponent } from './trip-activity.component';

describe('TripActivityComponent', () => {
  let component: TripActivityComponent;
  let fixture: ComponentFixture<TripActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripActivityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
