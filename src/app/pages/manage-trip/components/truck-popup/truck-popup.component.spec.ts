import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckPopupComponent } from './truck-popup.component';

describe('TruckPopupComponent', () => {
  let component: TruckPopupComponent;
  let fixture: ComponentFixture<TruckPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TruckPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TruckPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
