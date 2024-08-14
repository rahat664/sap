import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripUpdateComponent } from './trip-update.component';

describe('TripUpdateComponent', () => {
  let component: TripUpdateComponent;
  let fixture: ComponentFixture<TripUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripUpdateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
