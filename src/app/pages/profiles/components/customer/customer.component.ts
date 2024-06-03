import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {CustomerModel} from "./model/customer.model";
import {CommonModule} from "@angular/common";
import {CreatePopupComponent} from "../../../../shared/modal/create-popup/create-popup.component";
import {CustomerCreateComponent} from "../customer-create/customer-create.component";
import {GiveMaxHeightDirective} from "../../../../shared/directive/give-max-height.directive";
import {GetElementHeightDirective} from "../../../../shared/directive/get-element-height.directive";

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    CreatePopupComponent,
    CustomerCreateComponent,
    GiveMaxHeightDirective,
    GetElementHeightDirective
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit{
  customers: CustomerModel[] = []
  isOpen: boolean = false;
  height: any;
  constructor(private service: UserService) { }
  ngOnInit(): void {
    this.getCustomer();
  }

  getCustomer() {
    this.service.getUser('Customer').subscribe((res: any) => {
      this.customers = res.data
    });
  }

  onClickAddCustomer() {
    this.isOpen = true;
  }
}
