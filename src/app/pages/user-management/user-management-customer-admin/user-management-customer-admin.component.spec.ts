import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementCustomerAdminComponent } from './user-management-customer-admin.component';

describe('UserManagementCustomerAdminComponent', () => {
  let component: UserManagementCustomerAdminComponent;
  let fixture: ComponentFixture<UserManagementCustomerAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementCustomerAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementCustomerAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
