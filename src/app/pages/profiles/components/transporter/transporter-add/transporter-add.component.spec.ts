import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransporterAddComponent } from './transporter-add.component';

describe('TransporterAddComponent', () => {
  let component: TransporterAddComponent;
  let fixture: ComponentFixture<TransporterAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransporterAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TransporterAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
