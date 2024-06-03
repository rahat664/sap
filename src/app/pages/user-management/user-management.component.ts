import {Component} from '@angular/core';
import {CustomInputComponent} from "../../shared/modules/custom-input/custom-input.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {CustomInputSelectModel} from "../../shared/modules/custom-input/custom-input-select.model";
import {GetClickEventDirective} from "../../shared/directive/get-click-event.directive";

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CustomInputComponent,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    GetClickEventDirective
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  filterOpened: boolean;
  statusFilter: number = 0;
  roleFilter: number = 0;
  statusInputPlaceholder: string = 'All';
  roleInputPlaceholder: string = 'All';
  statusOptionsArray: CustomInputSelectModel[] = [
    {id: 1, value: 'Active', selected: false},
    {id: 2, value: 'Inactive', selected: false},
    {id: 3, value: 'All', selected: true}
  ];
  roleOptionsArray: CustomInputSelectModel[] = [
    {
      id: 1,
      value: 'Admin',
      selected: false
    },
    {
      id: 2,
      value: 'User',
      selected: false
    },
    {
      id: 3,
      value: 'All',
      selected: false
    }
  ]
  statusOpened: boolean = false;
  roleOpened: boolean = false;

  getFilterLength() {
    return this.statusFilter + this.roleFilter;
  }

  onClearFilter() {

  }

  onSelectStatus($event: number) {

  }

  onClickStatus($event: boolean) {
    this.roleOpened = false;
    this.statusOpened = $event;
  }
  onClickRole($event: boolean) {
    this.statusOpened = false;
    this.roleOpened = $event;
  }
}
