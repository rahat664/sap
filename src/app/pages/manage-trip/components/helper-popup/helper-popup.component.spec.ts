import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperPopupComponent } from './helper-popup.component';

describe('HelperPopupComponent', () => {
  let component: HelperPopupComponent;
  let fixture: ComponentFixture<HelperPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelperPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HelperPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
