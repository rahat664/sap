import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomInputSelectModel } from '../../shared/modules/custom-input/custom-input-select.model';
import { GetClickEventDirective } from '../../shared/directive/get-click-event.directive';
import { UserService } from '../profiles/services/user.service';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { UserModel } from './models/user.model';
import { UserCreateComponent } from './user-create/user-create.component';
import { roles } from './models/role-file';
import { CreatePopupComponent } from '../../shared/modal/create-popup/create-popup.component';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
import { ValidationService } from '../../shared/services/validation/validation.service';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { debounceTime } from 'rxjs';
import { HandleToastrService } from '../../shared/services/handle-toastr/handle-toastr.service';
import { DriverEditSharedService } from '../profiles/services/driver-edit-shared.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmUpdateComponent } from '../manage-trip/components/confirm-update/confirm-update.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    CustomInputComponent,
    CommonModule,
    ReactiveFormsModule,
    GetClickEventDirective,
    GiveMaxHeightDirective,
    GetElementHeightDirective,
    CreatePopupComponent,
    UserCreateComponent,
    LoadingComponent,
    CheckTheHeightCrossMaxHeightOrNotDirective,
    DatePipe,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  filterOpened: boolean = true;
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
  roleOptionsArray: CustomInputSelectModel[] = roles;
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
  statusValue: string = 'Active';
  searchValue: string;
  departmentFilter: string;
  size: number = 30;

  constructor(
    private service: UserService,
    private validation: ValidationService,
    private toastr: HandleToastrService,
    private shared: DriverEditSharedService
  ) {}

  ngOnInit() {
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

  // TODO: 'Have to fix the issue with the status filter'

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
    this.roleOpened = false;
    this.page = 0;
    this.roleInputPlaceholder = this.roleOptionsArray.find(
      item => item.id === $event
    ).value;
    this.roleFilter = 1;
    this.departmentFilter = this.roleInputPlaceholder;
    this.Users = [];
    this.getUserList();
  }

  onClickAddUser() {
    const dialogRef = this.dialog
      .open(UserCreateComponent, {})
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.Users = [];
          this.getUserList();
        }
      });
  }

  private getUserList() {
    this.page = 0;
    this.Users = [];
    this.loading = true;
    if (this.departmentFilter && !this.searchValue && !this.statusValue) {
      this.service
        .getUsers(this.page, null, null, this.departmentFilter)
        .subscribe((res: any) => {
          this.Users = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (
      this.searchValue &&
      !this.statusValue &&
      !this.departmentFilter
    ) {
      this.service
        .getUsers(this.page, null, this.searchValue, null)
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.Users = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (
      this.statusValue &&
      !this.searchValue &&
      !this.departmentFilter
    ) {
      this.service
        .getUsers(this.page, this.size, this.statusValue, null, null)
        .subscribe((res: any) => {
          this.Users = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.statusValue && this.searchValue && !this.departmentFilter) {
      // search with debounceTime
      this.service
        .getUsers(
          this.page,
          this.size,
          this.statusValue,
          this.searchValue,
          null
        )
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.Users = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.statusValue && this.departmentFilter && !this.searchValue) {
      this.service
        .getUsers(
          this.page,
          this.size,
          this.statusValue,
          null,
          this.departmentFilter
        )
        .subscribe((res: any) => {
          this.Users = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.searchValue && this.departmentFilter && !this.statusValue) {
      this.service
        .getUsers(this.page, null, this.searchValue, this.departmentFilter)
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.Users = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.statusValue && this.searchValue && this.departmentFilter) {
      this.service
        .getUsers(
          this.page,
          this.size,
          this.statusValue,
          this.searchValue,
          this.departmentFilter
        )
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.Users = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else {
      this.service.getUsers(this.page).subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    }
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
    this.dialog
      .open(ConfirmUpdateComponent, {
        width: '21.375rem',
        data: {
          title: 'Change Status',
          text: `Are you sure you want to ${status} ${name}?`,
          buttonText: status,
        },
      })
      .afterClosed()
      .subscribe((result: any) => {
        if (result === 'updated') {
          this.performChangeStatus();
        }
      });
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
        this.toastr.showSuccess(response);
        this.status = '';
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
    if (this.departmentFilter && !this.searchValue && !this.statusValue) {
      this.service
        .getUsers(this.page, null, null, this.departmentFilter)
        .subscribe((res: any) => {
          this.Users.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (
      this.searchValue &&
      !this.statusValue &&
      !this.departmentFilter
    ) {
      this.service
        .getUsers(this.page, null, this.searchValue, null)
        .subscribe((res: any) => {
          this.Users.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (
      this.statusValue &&
      !this.searchValue &&
      !this.departmentFilter
    ) {
      this.service
        .getUsers(this.page, this.size, this.statusValue, null, null)
        .subscribe((res: any) => {
          this.Users.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.statusValue && this.searchValue && !this.departmentFilter) {
      this.service
        .getUsers(
          this.page,
          this.size,
          this.statusValue,
          this.searchValue,
          null
        )
        .subscribe((res: any) => {
          this.Users.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.statusValue && this.departmentFilter && !this.searchValue) {
      this.service
        .getUsers(
          this.page,
          this.size,
          this.statusValue,
          null,
          this.departmentFilter
        )
        .subscribe((res: any) => {
          this.Users.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.searchValue && this.departmentFilter && !this.statusValue) {
      this.service
        .getUsers(this.page, null, this.searchValue, this.departmentFilter)
        .subscribe((res: any) => {
          this.Users.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else if (this.statusValue && this.searchValue && this.departmentFilter) {
      this.service
        .getUsers(
          this.page,
          this.size,
          this.statusValue,
          this.searchValue,
          this.departmentFilter
        )
        .subscribe((res: any) => {
          this.Users.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else {
      this.service.getUsers(this.page).subscribe((res: any) => {
        this.Users.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    }
  }

  onClickClear() {
    this.searchValue = '';
    this.Users = [];
    this.getUserList();
  }
}
