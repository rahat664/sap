import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CreatePopupComponent } from '../../../shared/modal/create-popup/create-popup.component';
import { CustomInputComponent } from '../../../shared/modules/custom-input/custom-input.component';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { GetClickEventDirective } from '../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../../shared/modules/loading/loading.component';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { UserCreateComponent } from '../user-create/user-create.component';
import { CustomInputSelectModel } from '../../../shared/modules/custom-input/custom-input-select.model';
import { UserModel } from '../models/user.model';
import { UserService } from '../../profiles/services/user.service';
import { ValidationService } from '../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import { DriverEditSharedService } from '../../profiles/services/driver-edit-shared.service';
import { CustomerService } from '../../profiles/services/customer.service';
import { UserCustomerAdminCreateComponent } from '../user-customer-admin-create/user-customer-admin-create.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-management-customer-admin',
  imports: [
    CustomInputComponent,
    DatePipe,
    GetClickEventDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    LoadingComponent,
    MatButton,
    MatMenu,
    MatMenuItem,
    NgForOf,
    NgIf,
    CommonModule,
    MatMenuTrigger,
  ],
  templateUrl: './user-management-customer-admin.component.html',
  styleUrl: './user-management-customer-admin.component.scss',
})
export class UserManagementCustomerAdminComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  filterOpened = true;
  statusFilter = 0;
  roleFilter = 0;
  statusInputPlaceholder = 'Active';
  roleInputPlaceholder = '';
  statusOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'Active', selected: true },
    { id: 2, value: 'Inactive', selected: false },
    { id: 3, value: 'Removed', selected: false },
    { id: 4, value: 'All', selected: false },
  ];
  roleOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'Admin', selected: false },
    { id: 2, value: 'User', selected: false },
  ];
  statusOpened = false;
  roleOpened = false;
  height = '0px';
  Users: UserModel[] = [];
  isOpen = false;
  actionOpened = false;
  selectedId: number;
  loading: boolean;
  elementHeight: any;
  page = 0;
  @ViewChild('scrollContainer') scrollContainer: ElementRef;
  totalPages: any;
  status: string;
  id: number;
  statusValue = 'Active';
  searchValue: string;
  departmentFilter: string;
  size = 30;

  constructor(
    private service: UserService,
    private validation: ValidationService,
    private toastr: HandleToastrService,
    private shared: DriverEditSharedService,
    private customer: CustomerService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.searchValue = '';
    this.statusValue = 'Active';
    this.statusOptionsArray.forEach(item => {
      item.selected = item.value === this.statusValue;
    });
    this.departmentFilter = '';
    this.getUserList();
  }

  getFilterLength() {
    return this.statusFilter + this.roleFilter;
  }

  onClearFilter() {
    this.loading = true;
    this.statusValue = 'Active';
    this.departmentFilter = '';
    this.searchValue = '';
    this.statusFilter = 0;
    this.roleFilter = 0;
    this.statusInputPlaceholder = 'Active';
    this.roleInputPlaceholder = '';
    this.statusOptionsArray.forEach(item => {
      item.selected = false;
    });
    this.roleOptionsArray.forEach(item => {
      item.selected = false;
    });
    this.Users = [];
    this.getUserList();
  }

  onSelectStatus($event: number) {
    this.statusOpened = false;
    this.statusFilter = 1;
    this.page = 0;
    this.size = 50;
    this.statusInputPlaceholder = this.statusOptionsArray.find(
      item => item.id === $event
    ).value;
    this.statusOptionsArray.forEach(item => {
      item.selected = item.id === $event;
    });
    if ($event == 4) {
      this.statusValue = '';
    } else {
      this.statusValue = this.statusInputPlaceholder;
    }
    this.Users = [];
    this.getUserList();
  }

  onClickStatus($event: boolean) {
    this.roleOpened = false;
    this.statusOpened = $event;
  }

  onClickRole($event: boolean) {
    this.statusOpened = false;
    this.roleOpened = $event;
  }

  private getUserRoles() {
    // this.service.getUserRoles().subscribe((res: any) => {
    //   res.data.forEach((item: { id: any; name: any; }) => {
    //     this.roleOptionsArray.push({id: item.id, value: item.name, selected: false})
    //   })
    // })
  }

  confirmOpened = false;
  buttonText: string;
  userName: string;

  onSelectRole($event: number) {
    this.loading = true;
    this.roleOpened = false;
    this.page = 0;
    this.roleInputPlaceholder = this.roleOptionsArray.find(
      item => item.id === $event
    ).value;
    this.roleFilter = 1;
    this.departmentFilter =
      this.roleInputPlaceholder === 'Admin'
        ? 'ROLE_CUSTOMER_ADMIN'
        : 'ROLE_CUSTOMER';
    this.Users = [];
    this.getUserList();
  }

  onClickAddUser() {
    this.dialog
      .open(UserCustomerAdminCreateComponent, {
        minWidth: '50vw',
      })
      .afterClosed()
      .subscribe({
        next: (isCreated: boolean) => {
          this.onCreateUser(isCreated);
        },
      });
  }

  private getUserList() {
    this.customer.searchCustomer(this.page, this.size).subscribe((res: any) => {
      this.customer
        .getCustomerUnderCompany(
          res.data.content[0].customerCode,
          this.page,
          this.size,
          this.statusValue,
          this.departmentFilter,
          this.searchValue
        )
        .subscribe((res: any) => {
          this.Users = res.data.content;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    });
  }

  actionOpen(id: number) {
    if (id === this.selectedId) {
      this.actionOpened = !this.actionOpened;
    } else {
      this.actionOpened = true;
    }
    this.selectedId = id;
  }

  changeStatus(id: number, name: string, status: string) {
    this.userName = null;
    this.id = null;
    this.status = '';
    this.buttonText = '';
    this.userName = name;
    this.id = id;
    this.status = status;
    this.buttonText = status;
    this.actionOpened = false;
    if (status == 'Inactive') {
      this.confirmOpened = true;
    }
    if (status == 'Active') {
      this.confirmOpened = true;
    }
    if (status == 'Removed') {
      this.confirmOpened = true;
    }
  }

  onCreateUser($event: boolean) {
    this.isOpen = !$event;
    this.Users = [];
    this.getUserList();
  }

  getMinHeightClass() {
    if (this.loading) {
      return `min-h-[${this.elementHeight}px]`;
    } else {
      return '';
    }
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
    this.shared.closeInputSelect.next(false);
    this.statusOpened = false;
    this.roleOpened = false;
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.scrolledData();
    }
  }

  performChangeStatus() {
    this.service.changeStatus(this.id, this.status).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.toastr.showSuccess(response);
        this.status = 'Active';
        this.statusInputPlaceholder = 'Active';
        this.id = null;
        this.confirmOpened = false;
        this.buttonText = '';
        this.userName = '';
        this.selectedId = null;
        this.searchValue = '';
        this.statusValue = 'Active';
        this.departmentFilter = '';
        this.statusFilter = 0;
        this.roleFilter = 0;
        this.getUserList();
      },
      error: err => {
        this.toastr.showError(err);
      },
    });
  }

  onMaxHeightCross($event: boolean) {
    // setTimeout(() => {
    //   if (!$event && this.totalPages > 1 && this.page != 1) {
    //     this.page = 1;
    //     this.scrolledData();
    //   }
    // }, 1);
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target?.length) {
      this.searchValue = target;
    } else {
      this.searchValue = '';
    }
    this.Users = [];
    this.getUserList();
  }

  private scrolledData() {
    this.customer.searchCustomer(this.page, this.size).subscribe((res: any) => {
      this.customer
        .getCustomerUnderCompany(
          res.data.content[0].customerCode,
          this.page,
          this.size,
          this.statusValue,
          this.departmentFilter,
          this.searchValue
        )
        .subscribe((res: any) => {
          this.Users = [...this.Users, ...res.data.content];
          this.loading = false;
        });
    });
  }

  onClickClear() {
    this.searchValue = '';
    this.Users = [];
    this.getUserList();
  }

  getUserType(roles: string[]) {
    const find = roles.find(role => role === 'ROLE_CUSTOMER_ADMIN');
    return find ? 'Admin' : 'User';
  }

  copyNumber($event, createdByPhone: string) {
    $event.stopPropagation();
    // remove first 3 characters from the phone number
    const phone = createdByPhone.slice(3);
    // copy the phone number to the clipboard
    this.service.copyToClipboard(phone);
  }
}
