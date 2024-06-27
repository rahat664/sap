import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckListPopupComponent } from './check-list-popup.component';

describe('CheckListPopupComponent', () => {
  let component: CheckListPopupComponent;
  let fixture: ComponentFixture<CheckListPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckListPopupComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CheckListPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
