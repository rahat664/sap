import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripInfoComponent } from './trip-info.component';

describe('TripInfoComponent', () => {
  let component: TripInfoComponent;
  let fixture: ComponentFixture<TripInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
