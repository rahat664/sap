import {Component} from '@angular/core';
import {CustomInputComponent} from "../../shared/modules/custom-input/custom-input.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {CustomInputSelectModel} from "../../shared/modules/custom-input/custom-input-select.model";
import {GetClickEventDirective} from "../../shared/directive/get-click-event.directive";
import {UserService} from "../profiles/services/user.service";
import {GiveMaxHeightDirective} from "../../shared/directive/give-max-height.directive";
import {GetElementHeightDirective} from "../../shared/directive/get-element-height.directive";
import {CreatePopupComponent} from "../../shared/modal/create-popup/create-popup.component";
import {CustomerCreateComponent} from "../profiles/components/customer/customer-create/customer-create.component";
import {UserModel} from "./models/user.model";
import {UserCreateComponent} from "./user-create/user-create.component";

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
    UserCreateComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  filterOpened: boolean;
  statusFilter: number = 0;
  roleFilter: number = 0;
  statusInputPlaceholder: string = 'Select Status';
  roleInputPlaceholder: string = 'Select Role';
  statusOptionsArray: CustomInputSelectModel[] = [
    {id: 1, value: 'Active', selected: false},
    {id: 2, value: 'Inactive', selected: false},
    {id: 3, value: 'All', selected: true}
  ];
  roleOptionsArray: CustomInputSelectModel[] = []
  statusOpened: boolean = false;
  roleOpened: boolean = false;
  height: string = '0px';
  Users: UserModel[] = [];
  isOpen: boolean = false;
  actionOpened: boolean = false;
  selectedId: number;

  constructor(private service: UserService) {
  }

  ngOnInit() {
    this.getUserRoles();
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
  }

  onSelectStatus($event: number) {
    this.statusFilter = 1;
    if ($event === 3) {
      this.statusInputPlaceholder = 'All';
    } else {
      this.statusInputPlaceholder = this.statusOptionsArray.find((item) => item.id === $event).value;
    }
  }

  onClickStatus($event: boolean) {
    this.roleOpened = false;
    this.statusOpened = $event;
    console.log('statusOpened', this.statusOpened);
  }

  onClickRole($event: boolean) {
    this.statusOpened = false;
    this.roleOpened = $event;
  }

  private getUserRoles() {
    this.service.getUserRoles().subscribe((res: any) => {
      res.data.forEach((item: { id: any; name: any; }) => {
        this.roleOptionsArray.push({id: item.id, value: item.name, selected: false})
      })
    })
  }

  onSelectRole($event: number) {
    this.roleInputPlaceholder = this.roleOptionsArray.find((item) => item.id === $event).value;
    this.roleFilter = 1;
  }

  onClickAddUser() {
    this.isOpen = true;
  }

  private getUserList() {
    this.service.getUser().subscribe((res: any) => {
      this.Users = res.data;
    })
  }


  actionOpen(id: number) {
    if (id === this.selectedId) {
      this.actionOpened = !this.actionOpened;
    } else {
      this.actionOpened = true;
    }
    this.selectedId = id;
  }
}
