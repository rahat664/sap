import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {CustomerModel} from "./model/customer.model";
import {CommonModule} from "@angular/common";
import {CreatePopupComponent} from "../../../../shared/modal/create-popup/create-popup.component";
import {CustomerCreateComponent} from "../customer-create/customer-create.component";
import {GiveMaxHeightDirective} from "../../../../shared/directive/give-max-height.directive";
import {GetElementHeightDirective} from "../../../../shared/directive/get-element-height.directive";
import {CustomerService} from "../../services/customer.service";
import {CustomInputComponent} from "../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../shared/directive/get-click-event.directive";

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    CreatePopupComponent,
    CustomerCreateComponent,
    GiveMaxHeightDirective,
    GetElementHeightDirective,
    CustomInputComponent,
    GetClickEventDirective
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit{
  customers: CustomerModel[] = []
  isOpen: boolean = false;
  height: any;
  filterOpened: boolean;
  statusFilter: number = 0;
  roleFilter: number = 0;
  constructor(private service: CustomerService) { }
  ngOnInit(): void {
    this.getCustomer();
  }

  getCustomer() {
    this.service.getCustomer().subscribe((res: any) => {
      this.customers = res.data
    });
  }

  onClickAddCustomer() {
    this.isOpen = true;
  }

  getFilterLength() {
    return this.statusFilter+this.roleFilter;
  }

  onClearFilter() {

  }
}
