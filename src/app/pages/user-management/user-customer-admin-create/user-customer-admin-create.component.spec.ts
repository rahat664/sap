import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCustomerAdminCreateComponent } from './user-customer-admin-create.component';

describe('UserCustomerAdminCreateComponent', () => {
  let component: UserCustomerAdminCreateComponent;
  let fixture: ComponentFixture<UserCustomerAdminCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCustomerAdminCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCustomerAdminCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
