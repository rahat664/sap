import { Component, OnInit } from '@angular/core';
import { CustomerModel } from './model/customer.model';
import { CommonModule } from '@angular/common';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { CustomerService } from '../../services/customer.service';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';

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
    GetClickEventDirective,
    LoadingComponent,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss',
})
export class CustomerComponent implements OnInit {
  customers: CustomerModel[] = [];
  isOpen = false;
  height: any;
  filterOpened: boolean;
  statusFilter = 0;
  roleFilter = 0;
  loading: boolean;
  size: number = 30;
  page: number = 0;
  totalPages: number;

  constructor(private service: CustomerService) {}

  ngOnInit(): void {
    this.getCustomer();
  }

  getCustomer() {
    this.loading = true;
    this.service.searchCustomer(this.page, this.size).subscribe((res: any) => {
      this.customers = res.data.content;
      this.totalPages = res.data.totalPages;
      this.loading = false;
    });
  }

  onClickAddCustomer() {
    this.isOpen = true;
  }

  getFilterLength() {
    return this.statusFilter + this.roleFilter;
  }

  onClearFilter() {}

  onCreateCustomer($event: boolean) {
    this.isOpen = !$event;
    this.customers = [];
    this.getCustomer();
  }

  onKeyUpSearch($event: any) {
    this.loading = true;
    const target = $event.target.value;
    if (target?.length > 0) {
      this.customers = [];
      if (target?.length == 11) {
        if (this.checkIfAllInputIsNumber(target)) {
          this.service
            .searchCustomer(this.page, this.size, null, target)
            .subscribe((res: any) => {
              this.customers = res.data.content;
              this.totalPages = res.data.totalPages;
              this.loading = false;
            });
        } else {
          this.service
            .searchCustomer(this.page, this.size, target, null)
            .subscribe((res: any) => {
              this.customers = res.data.content;
              this.totalPages = res.data.totalPages;
              this.loading = false;
            });
        }
      } else {
        this.service
          .searchCustomer(this.page, this.size, target, null)
          .subscribe((res: any) => {
            this.customers = res.data.content;
            this.totalPages = res.data.totalPages;
            this.loading = false;
          });
      }
    } else {
      this.getCustomer();
    }
  }

  private checkIfAllInputIsNumber(target: any) {
    return !isNaN(target);
  }

  onScrollEnd($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page = this.page + 1;
      this.service
        .searchCustomer(this.page, this.size)
        .subscribe((res: any) => {
          this.customers.push(...res.data.content);
          this.totalPages = res.data.totalPages;
        });
    }
  }
}
