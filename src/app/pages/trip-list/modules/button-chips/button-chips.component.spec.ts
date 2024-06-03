import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonChipsComponent } from './button-chips.component';

describe('ButtonChipsComponent', () => {
  let component: ButtonChipsComponent;
  let fixture: ComponentFixture<ButtonChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonChipsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ButtonChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
