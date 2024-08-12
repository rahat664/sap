import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransporterPopupComponent } from './transporter-popup.component';

describe('TransporterPopupComponent', () => {
  let component: TransporterPopupComponent;
  let fixture: ComponentFixture<TransporterPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransporterPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TransporterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
