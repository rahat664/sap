import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { NgClass, NgForOf, NgIf } from '@angular/common';
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
import { ConfirmModalComponent } from '../../shared/modules/confirm-modal/confirm-modal.component';
import { ToastrService } from 'ngx-toastr';
import {
  CheckTheHeightCrossMaxHeightOrNotDirective,
} from '../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CustomInputComponent,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    GetClickEventDirective,
    GiveMaxHeightDirective,
    GetElementHeightDirective,
    CreatePopupComponent,
    UserCreateComponent,
    LoadingComponent,
    ConfirmModalComponent,
    CheckTheHeightCrossMaxHeightOrNotDirective,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  filterOpened: boolean;
  statusFilter = 0;
  roleFilter = 0;
  statusInputPlaceholder = 'Active';
  roleInputPlaceholder = '';
  statusOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'Active', selected: false },
    { id: 2, value: 'Inactive', selected: false },
    { id: 3, value: 'All', selected: true },
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

  constructor(private service: UserService, private validation: ValidationService, private toastr: ToastrService) {
  }

  ngOnInit() {
    this.searchValue = '';
    this.statusValue = 'Active';
    this.statusOptionsArray.forEach((item) => {
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
    this.statusOptionsArray.forEach((item) => {
      item.selected = false;
    });
    this.roleOptionsArray.forEach((item) => {
      item.selected = false;
    });
    this.Users = [];
    this.getUserList();
  }

  // TODO: 'Have to fix the issue with the status filter'

  onSelectStatus($event: number) {
    this.roleOpened = false;
    this.statusFilter = 1;
    this.statusInputPlaceholder = this.statusOptionsArray.find((item) => item.id === $event).value;
    this.statusOptionsArray.forEach((item) => {
      item.selected = item.id === $event;
    });
    if ($event == 3) {
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
    this.statusOpened = false;
    this.roleInputPlaceholder = this.roleOptionsArray.find((item) => item.id === $event).value;
    this.roleFilter = 1;
    this.departmentFilter = this.roleInputPlaceholder;
    this.Users = [];
    this.getUserList();
  }


  onClickAddUser() {
    this.isOpen = true;
  }

  private getUserList() {
    this.page = 0;
    this.Users = [];
    this.loading = true;
    if (this.departmentFilter && !this.searchValue && !this.statusValue) {
      this.service.getUsers(this.page, null, null, this.departmentFilter).subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.searchValue && !this.statusValue && !this.departmentFilter) {
      this.service.getUsers(this.page, null, this.searchValue, null).pipe(
        debounceTime(500)

      ).subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && !this.searchValue && !this.departmentFilter) {
      this.service.getUsers(this.page, this.statusValue, null, null).subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && this.searchValue && !this.departmentFilter) {
      // search with debounceTime
      this.service.getUsers(this.page, this.statusValue, this.searchValue, null).pipe(
        debounceTime(500)
      ).subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && this.departmentFilter && !this.searchValue) {
      this.service.getUsers(this.page, this.statusValue, null, this.departmentFilter).subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.searchValue && this.departmentFilter && !this.statusValue) {
      this.service.getUsers(this.page, null, this.searchValue, this.departmentFilter).pipe(
        debounceTime(500)
      ).subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && this.searchValue && this.departmentFilter) {
      this.service.getUsers(this.page, this.statusValue, this.searchValue, this.departmentFilter).pipe(
        debounceTime(500)
      ).subscribe((res: any) => {
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
    if (status == 'Inactive') {
      this.confirmOpened = true;
    } if (status == 'Active') {
      this.confirmOpened = true;
    } if (status == 'Removed') {
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
    this.statusOpened = false;
    this.roleOpened = false;
  }

  onBottom($event: boolean) {
    if ($event && (this.page < this.totalPages - 1)) {
      this.page++;
      this.scrolledData()
    }
  }

  performChangeStatus() {
    this.service.changeStatus(this.id, this.status).subscribe({
      next: (response: any) => {
        this.toastr.success(response);
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
      error: (err) => {
        this.toastr.error(err);
      },
    });
  }


  onMaxHeightCross($event: boolean) {
    setTimeout(() => {
      if (!$event && this.totalPages > 1 && this.page != 1) {
        this.page = 1;
        this.service.getUsers(this.page).subscribe((res: any) => {
          this.Users.push(...res.responses);
        });
      }
    }, 1);
  }

  onKeyUpSearch($event: KeyboardEvent) {
      this.loading = true;
      const target = ($event.target as HTMLInputElement).value;
      if (target.length) {
        this.searchValue = target;
      } else {
        this.searchValue = '';
      }
      this.Users = [];
      this.getUserList();
  }

  private scrolledData() {
    if (this.departmentFilter && !this.searchValue && !this.statusValue) {
      this.service.getUsers(this.page, null, null, this.departmentFilter).subscribe((res: any) => {
        this.Users.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.searchValue && !this.statusValue && !this.departmentFilter) {
      this.service.getUsers(this.page, null, this.searchValue, null).subscribe((res: any) => {
        this.Users.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && !this.searchValue && !this.departmentFilter) {
      this.service.getUsers(this.page, this.statusValue, null, null).subscribe((res: any) => {
        this.Users.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && this.searchValue && !this.departmentFilter) {
      this.service.getUsers(this.page, this.statusValue, this.searchValue, null).subscribe((res: any) => {
        this.Users.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && this.departmentFilter && !this.searchValue) {
      this.service.getUsers(this.page, this.statusValue, null, this.departmentFilter).subscribe((res: any) => {
        this.Users.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.searchValue && this.departmentFilter && !this.statusValue ) {
      this.service.getUsers(this.page, null, this.searchValue, this.departmentFilter).subscribe((res: any) => {
        this.Users.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    } else if (this.statusValue && this.searchValue && this.departmentFilter) {
      this.service.getUsers(this.page, this.statusValue, this.searchValue, this.departmentFilter).subscribe((res: any) => {
        this.Users.push(...res.data.responses)
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
}
