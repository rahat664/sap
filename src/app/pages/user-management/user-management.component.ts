import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {CustomInputComponent} from "../../shared/modules/custom-input/custom-input.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {CustomInputSelectModel} from "../../shared/modules/custom-input/custom-input-select.model";
import {GetClickEventDirective} from "../../shared/directive/get-click-event.directive";
import {UserService} from "../profiles/services/user.service";
import {GiveMaxHeightDirective} from "../../shared/directive/give-max-height.directive";
import {GetElementHeightDirective} from "../../shared/directive/get-element-height.directive";
import {UserModel} from "./models/user.model";
import {UserCreateComponent} from "./user-create/user-create.component";
import {roles} from "./models/role-file";
import {CreatePopupComponent} from "../../shared/modal/create-popup/create-popup.component";
import {LoadingComponent} from "../../shared/modules/loading/loading.component";
import {ValidationService} from "../../shared/services/validation/validation.service";
import {ConfirmModalComponent} from "../../shared/modules/confirm-modal/confirm-modal.component";
import {ToastrService} from "ngx-toastr";
import {
  CheckTheHeightCrossMaxHeightOrNotDirective
} from "../../shared/directive/check-the-height-cross-max-height-or-not.directive";

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
    CheckTheHeightCrossMaxHeightOrNotDirective
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  filterOpened: boolean;
  statusFilter: number = 0;
  roleFilter: number = 0;
  statusInputPlaceholder: string = '';
  roleInputPlaceholder: string = '';
  statusOptionsArray: CustomInputSelectModel[] = [
    {id: 1, value: 'Active', selected: false},
    {id: 2, value: 'Inactive', selected: false},
    {id: 3, value: 'All', selected: true}
  ];
  roleOptionsArray: CustomInputSelectModel[] = roles;
  statusOpened: boolean = false;
  roleOpened: boolean = false;
  height: string = '0px';
  Users: UserModel[] = [];
  isOpen: boolean = false;
  actionOpened: boolean = false;
  selectedId: number;
  loading: boolean;
  elementHeight: any;
  page: number = 0;
  @ViewChild('scrollContainer') scrollContainer: ElementRef;
  totalPages: any;
  status: string;
  id: number;

  constructor(private service: UserService, private validation: ValidationService, private toastr: ToastrService) {
  }

  ngOnInit() {
    this.getUserList();

  }

  getFilterLength() {
    return this.statusFilter + this.roleFilter;
  }

  onClearFilter() {
    this.statusFilter = 0;
    this.roleFilter = 0;
    this.statusInputPlaceholder = '';
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
    this.statusFilter = 1;
    if ($event === 3) {
      this.statusInputPlaceholder = 'All';
      this.Users = [];
      if (this.roleFilter === 0) {
        this.getUserList();
      } else {
        this.service.getUser().subscribe((res: any) => {
          this.Users = res.data.filter((item) => {
            return item.designation?.split('|')[1] === this.roleInputPlaceholder;
          });
        });
      }
    } else {
      this.statusInputPlaceholder = this.statusOptionsArray.find((item) => item.id === $event).value;
      if ($event === 1) {
        this.service.getUser().subscribe((res: any) => {
          this.Users = res.data.filter((item) => {
            if (this.roleFilter === 0) {
              return item.enabled === true;
            } else {
              return item.enabled === true && item.designation?.split('|')[1] === this.roleInputPlaceholder;
            }
          });
        });
      } else {
        this.service.getUser().subscribe((res: any) => {
          this.Users = res.data.filter((item) => {
            if (this.roleFilter === 0) {
              return item.enabled === false;
            } else {
              return item.enabled === false && item.designation?.split('|')[1] === this.roleInputPlaceholder;
            }
          });
        });
      }
    }
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

  confirmOpened: boolean = false;
  buttonText: string;
  userName: string;

  onSelectRole($event: number) {
    this.roleInputPlaceholder = this.roleOptionsArray.find((item) => item.id === $event).value;
    this.roleFilter = 1;
    this.Users = [];
    if (this.statusFilter === 0) {
      this.service.getUser().subscribe((res: any) => {
        this.Users = res.data.filter((item) => {
          return item.designation?.split('|')[1] === this.roleInputPlaceholder;
        });
      });
    } else {
      if (this.statusInputPlaceholder === 'All') {
        this.service.getUser().subscribe((res: any) => {
          this.Users = res.data.filter((item) => {
            return item.designation?.split('|')[1] === this.roleInputPlaceholder;
          });
        });
      } else if (this.statusInputPlaceholder === 'Active') {
        this.service.getUser().subscribe((res: any) => {
          this.Users = res.data.filter((item) => {
            return item.enabled === true && item.designation?.split('|')[1] === this.roleInputPlaceholder;
          });
        });
      } else {
        this.service.getUser().subscribe((res: any) => {
          this.Users = res.data.filter((item) => {
            return item.enabled === false && item.designation?.split('|')[1] === this.roleInputPlaceholder;
          });
        });
      }
    }
  }

  onClickAddUser() {
    this.isOpen = true;
  }

  private getUserList() {
    this.page = 0;
    this.Users = [];
    this.loading = true;
    this.service.getUsers(this.page).subscribe((res: any) => {
      this.Users =  res.responses;
      this.loading = false;
      this.totalPages = res.totalPages;
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
    } else if (status == 'Active') {
      this.confirmOpened = true;
    } else if (status == 'Removed') {
      this.confirmOpened = true;
    }
  }

  confirmAction() {
    this.service.changeStatus(this.id, this.status).subscribe({
      next: (response: any) => {
        this.toastr.success(response);
        this.Users = [];
        this.getUserList();
      },
      error: (err) => {
        this.toastr.error(err);
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
      return `min-h-[${this.elementHeight}px]`
    } else {
      return ''
    }
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
    this.statusOpened = false;
    this.roleOpened = false;
  }

  onBottom($event: boolean) {
    if ($event && (this.page < this.totalPages-1)) {
      this.page++;
      this.service.getUsers(this.page).subscribe((res: any) => {
        this.Users.push(...res.responses);
      });
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
        this.getUserList();
      },
      error: (err) => {
        this.toastr.error(err);
      }
    });
  }
  onMaxHeightCross($event: boolean) {
    setTimeout(() => {
      if (!$event && this.totalPages > 1 && this.page != 1) {
        this.page = 1
        this.service.getUsers(this.page).subscribe((res: any) => {
          this.Users.push(...res.responses);
        });
      }
    }, 1);
  }
}
