import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverPopupComponent } from './driver-popup.component';

describe('DriverPopupComponent', () => {
  let component: DriverPopupComponent;
  let fixture: ComponentFixture<DriverPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
