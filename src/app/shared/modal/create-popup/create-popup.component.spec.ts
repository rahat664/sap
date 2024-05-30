import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePopupComponent } from './create-popup.component';

describe('CreatePopupComponent', () => {
  let component: CreatePopupComponent;
  let fixture: ComponentFixture<CreatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
