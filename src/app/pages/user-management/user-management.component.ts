import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';
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
import { HandleToastrService } from '../../shared/services/handle-toastr/handle-toastr.service';
import { DriverEditSharedService } from '../profiles/services/driver-edit-shared.service';
import { ConfirmUpdateComponent } from '../manage-trip/components/confirm-update/confirm-update.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TripListFilterComponent } from '../trip-list/components/trip-list-filter/trip-list-filter.component';
import { UserFilterComponent } from './user-filter/user-filter.component';

@Component({
  selector: 'app-user-management',
  imports: [
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    LoadingComponent,
    GiveMaxHeightDirective,
    GetElementHeightDirective,
    UserFilterComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer: ElementRef;
  readonly dialog = inject(MatDialog);
  filterOpened = false;
  statusFilter = 0;
  roleFilter = 0;
  statusInputPlaceholder = '';
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
  loading = false;
  elementHeight: any;
  page = 0;
  totalPages: number = 0;
  statusValue = 'Active';
  searchValue = '';
  departmentFilter = '';
  size = 30;
  filterData: any = {};
  filterApplied: boolean = true;

  constructor(
    private service: UserService,
    private validation: ValidationService,
    private toastr: HandleToastrService,
    private shared: DriverEditSharedService
  ) {}

  ngOnInit() {
    localStorage.removeItem('tripFilterData')
    localStorage.setItem('tripFilterData', JSON.stringify({
      status: 'Active',
      department: this.departmentFilter,
    }));
    this.resetFilters();
    this.getUserList();
  }



  onClearFilter(): void {
    this.resetFilters();
    this.Users = [];
    this.getUserList();
  }

  private resetFilters(): void {
    this.statusValue = 'Active';
    this.departmentFilter = '';
    this.searchValue = '';
    this.statusFilter = 0;
    this.roleFilter = 0;
    this.statusInputPlaceholder = 'Active';
    this.roleInputPlaceholder = '';
    this.statusOptionsArray.forEach(item => (item.selected = false));
    this.roleOptionsArray.forEach(item => (item.selected = false));
  }

  onSelectStatus(id: number): void {
    this.statusOpened = false;
    this.statusFilter = 1;
    this.page = 0;
    this.size = 50;
    this.statusInputPlaceholder =
      this.statusOptionsArray.find(item => item.id === id)?.value || '';
    this.statusValue = id === 4 ? '' : this.statusInputPlaceholder;
    this.updateSelectedOptions(this.statusOptionsArray, id);
    this.Users = [];
    this.getUserList();
  }

  onClickStatus(isOpened: boolean): void {
    this.roleOpened = false;
    this.statusOpened = isOpened;
  }

  onClickRole(isOpened: boolean): void {
    this.statusOpened = false;
    this.roleOpened = isOpened;
  }

  onSelectRole(id: number): void {
    this.roleOpened = false;
    this.page = 0;
    this.roleInputPlaceholder =
      this.roleOptionsArray.find(item => item.id === id)?.value || '';
    this.roleFilter = 1;
    this.departmentFilter = this.roleInputPlaceholder;
    this.Users = [];
    this.getUserList();
  }

  onClickAddUser(): void {
    this.dialog
      .open(UserCreateComponent, {
        minWidth: '50vw',
      })
      .afterClosed()
      .subscribe({
        next: (isCreated: boolean) => {
          this.onCreateUser(isCreated);
        },
      });
  }

  private getUserList(): void {
    this.loading = true;
    const params = {
      page: this.page,
      size: this.size,
      status: this.statusValue || null,
      search: this.searchValue || null,
      department: this.departmentFilter || null,
    };

    this.service
      .getUsers(params)
      .pipe(debounceTime(1000))
      .subscribe((res: any) => {
        this.Users = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }

  actionOpen(id: number): void {
    this.actionOpened = id === this.selectedId ? !this.actionOpened : true;
    this.selectedId = id;
  }

  changeStatus(id: number, name: string, status: string): void {
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
      .subscribe(result => {
        if (result === 'updated') {
          this.performChangeStatus(id, status);
        }
      });
  }

  onCreateUser(isCreated: boolean): void {
    this.isOpen = !isCreated;
    this.Users = [];
    this.getUserList();
  }

  getMinHeightClass(): string {
    return this.loading ? `min-h-[${this.elementHeight}px]` : '';
  }

  onClickFilterOpened(): void {
    this.filterOpened = !this.filterOpened;
    this.shared.closeInputSelect.next(false);
    this.statusOpened = false;
    this.roleOpened = false;
  }

  onBottom(isBottom: boolean): void {
    console.log(isBottom);
    if (isBottom && this.page < this.totalPages - 1) {
      this.page++;
      this.scrolledData();
    }
  }

  private performChangeStatus(id: number, status: string): void {
    this.service.changeStatus(id, status).subscribe({
      next: (response: any) => {
        this.toastr.showSuccess(response);
        this.resetFilters();
        this.Users = [];
        this.getUserList();
      },
      error: err => {
        this.toastr.showError(err);
      },
    });
  }

  onKeyUpSearch(event: KeyboardEvent): void {
    this.page = 0;
    this.size = 30;
    this.statusValue = '';
    this.roleInputPlaceholder = '';
    this.statusInputPlaceholder = 'All';
    this.statusOptionsArray.forEach(item => (item.selected = false));
    this.loading = true;
    this.searchValue = (event.target as HTMLInputElement).value || '';
    this.Users = [];
    this.getUserList();
  }

  private scrolledData(): void {
    // update the data when the user scrolls to the bottom of the page
    this.service
      .getUsers({
        page: this.page,
        size: this.size,
        status: this.statusValue || null,
        search: this.searchValue || null,
        department: this.departmentFilter || null,
      })
      .subscribe((res: any) => {
        this.Users = [...this.Users, ...res.data.responses];
      });
  }

  onClickClear(): void {
    this.searchValue = '';
    this.Users = [];
    this.getUserList();
  }
  cus;

  private updateSelectedOptions(
    array: CustomInputSelectModel[],
    selectedId: number
  ): void {
    array.forEach(item => (item.selected = item.id === selectedId));
  }

  copyNumber($event, createdByPhone: string) {
    $event.stopPropagation();
    // remove first 3 characters from the phone number
    const phone = createdByPhone.slice(3);
    // copy the phone number to the clipboard
    this.service.copyToClipboard(phone);
  }

  onFilterData($event: any) {
    this.filterData =  $event
  }

  onFilterApply() {
    if (
      this.filterData?.status ||
      this.filterData?.department
    ) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.statusValue = this.filterData?.status;
      this.departmentFilter = this.filterData?.department;
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getUserList();
    } else {
      localStorage.removeItem('tripFilterData');
      this.filterApplied = false;
      this.Users = [];
      this.statusValue = '';
      this.departmentFilter = '';
      this.loading = true;
      this.page = 0;
      this.size = 30;
      this.getUserList();
    }
  }
  get filterSummary(): string {
    const parts: string[] = [];

    if (this.filterData.status || this.statusValue)
      parts.push(`Status: <b>${this.filterData.status ? this.filterData.status : this.statusValue}</b>`);
    if (this.filterData.department)
      parts.push(`Department: <b>${this.filterData.department}</b>`);

    return parts.join(', ');
  }

  onClickFilterOpen() {
    this.filterOpened = true
  }

  onCLickClearAll() {
    localStorage.removeItem('tripFilterData');
    this.filterApplied = true;
    this.Users = [];
    this.filterData = {};
    this.statusValue = 'Active';
    this.departmentFilter = '';
    this.loading = true;
    this.page = 0;
    this.size = 30;
    this.getUserList();
  }
}
