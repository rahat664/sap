import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripCreateOverviewComponent } from './trip-create-overview.component';

describe('TripCreateOverviewComponent', () => {
  let component: TripCreateOverviewComponent;
  let fixture: ComponentFixture<TripCreateOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCreateOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripCreateOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
