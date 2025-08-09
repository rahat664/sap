import { Component, inject, OnInit } from '@angular/core';
import { CustomerModel } from './model/customer.model';
import { CommonModule, DatePipe } from '@angular/common';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { CustomerService } from '../../services/customer.service';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';
import { DriverEditSharedService } from '../../services/driver-edit-shared.service';
import { DateEnum } from '../../../trip-list/Enum/date.enum';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { UserFilterComponent } from '../../../user-management/user-filter/user-filter.component';
import { CustomerFilterComponent } from './customer-filter/customer-filter.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-customer',
  imports: [
    CommonModule,
    GiveMaxHeightDirective,
    GetElementHeightDirective,
    LoadingComponent,
    FormsModule,
    numberPipe,
    CustomerFilterComponent,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss',
})
export class CustomerComponent implements OnInit {
  customers: CustomerModel[] = [];
  isOpen = false;
  height: any;
  loading: boolean;
  size = 30;
  page = 0;
  totalPages: number;
  searchValue: any;
  readonly dialog = inject(MatDialog);
  filterOpened: boolean = false;
  dateFilter: number = 0;
  dateOpened: boolean;
  inputPlaceholder: string = '';
  filterForm: FormGroup;
  private from: any;
  private to: any;
  private isDateOpened: boolean;
  dateOptionArray: CustomInputSelectModel[];
  filterApplied: boolean = false;
  filterData: any = {};

  constructor(
    private service: CustomerService,
    private formBuilder: FormBuilder,
    private shared: DriverEditSharedService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    localStorage.removeItem('tripFilterData');
    this.generateDateOptionsArray();
    this.getCustomerFromResolvedState();
  }

  private generateDateOptionsArray() {
    this.dateOptionArray = [
      { id: DateEnum.Today, value: 'Today', selected: false },
      { id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false },
      { id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false },
      { id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false },
      { id: DateEnum.Custom, value: 'Custom', selected: false },
    ];
  }

  getCustomer() {
    this.loading = true;
    this.service
      .searchCustomer(this.page, this.size, null, null, this.from, this.to)
      .subscribe((res: any) => {
        this.customers = res.data.content;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }

  onClickAddCustomer() {
    this.dialog
      .open(CustomerCreateComponent, {
        minWidth: '50vw',
        maxHeight: '90vh',
      })
      .afterClosed()
      .subscribe(value => {
        if (value) {
          this.customers = [];
          this.getCustomer();
        }
      });
  }

  onKeyUpSearch($event: any) {
    this.searchValue = $event.target.value;
    this.loading = true;
    const target = $event.target.value;
    if (target?.length > 0) {
      this.customers = [];
      if (target?.length == 11) {
        if (this.checkIfAllInputIsNumber(target)) {
          this.service
            .searchCustomer(
              this.page,
              this.size,
              null,
              target,
              this.from,
              this.to
            )
            .subscribe((res: any) => {
              this.customers = res.data.content;
              this.totalPages = res.data.totalPages;
              this.loading = false;
            });
        } else {
          this.service
            .searchCustomer(
              this.page,
              this.size,
              target,
              null,
              this.from,
              this.to
            )
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
      this.page = 0;
      this.getCustomer();
    }
  }

  private checkIfAllInputIsNumber(target: any) {
    return !isNaN(target);
  }

  onScrollEnd($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page = this.page + 1;
      if (this.checkIfAllInputIsNumber(this.searchValue)) {
        this.service
          .searchCustomer(
            this.page,
            this.size,
            null,
            this.searchValue,
            this.from,
            this.to
          )
          .subscribe((res: any) => {
            this.customers = res.data.content;
            this.totalPages = res.data.totalPages;
            this.loading = false;
          });
      } else {
        this.service
          .searchCustomer(
            this.page,
            this.size,
            this.searchValue,
            null,
            this.from,
            this.to
          )
          .subscribe((res: any) => {
            this.customers.push(...res.data.content);
            this.totalPages = res.data.totalPages;
          });
      }
    }
  }

  onClickClear() {
    this.searchValue = '';
    this.page = 0;
    this.getCustomer();
  }

  copyNumber($event, createdByPhone: string) {
    $event.stopPropagation();
    // remove first 3 characters from the phone number
    const phone = createdByPhone.slice(3);
    // copy the phone number to the clipboard
    this.service.copyToClipboard(phone);
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
  }

  onClearFilter() {
    this.filterForm.reset();
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.getCustomer();
  }

  onSelectedFromDate($event: string) {
    this.filterForm.get('startDate')?.setValue($event);
  }

  onSelectedToDate($event: string) {
    this.filterForm.get('endDate')?.setValue($event);
    this.from = this.filterForm.get('startDate')?.value || '';
    this.to = this.filterForm.get('endDate')?.value || '';
    this.dateOpened = false;
    this.isDateOpened = false;
    this.page = 0;
    this.size = 30;
    this.getCustomer();
  }

  onSelectDate($event: number) {
    this.dateFilter = 1;
    if ($event === DateEnum.Custom) {
      this.shared.closeInputSelect.next(true);
    } else {
      this.shared.closeInputSelect.next(false);
      this.inputPlaceholder =
        this.dateOptionArray.find(x => x.id === $event)?.value || '';
      this.dateOptionArray.forEach(x => (x.selected = x.id === $event));
      this.setDateRange($event);
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getCustomer();
    }
  }

  private setDateRange(dateEnum: DateEnum) {
    const fromDate = new Date();
    // to date should be yesterday
    const toDate = new Date();
    switch (dateEnum) {
      case DateEnum.Today:
        fromDate.setDate(fromDate.getDate());
        toDate.setDate(toDate.getDate());
        break;
      case DateEnum.LastSevenDays:
        // shouldn't be count today
        fromDate.setDate(fromDate.getDate() - 7);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.LastFifteenDays:
        fromDate.setDate(fromDate.getDate() - 15);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.LastThirtyDays:
        fromDate.setDate(fromDate.getDate() - 30);
        toDate.setDate(toDate.getDate() - 1);
        break;
    }
    this.from = this.datePipe.transform(fromDate, 'yyyy-MM-dd') || '';
    this.to = this.datePipe.transform(toDate, 'yyyy-MM-dd') || '';
  }

  onClickFilterOpen() {
    this.filterOpened = true;
  }

  get filterSummary(): string {
    const parts: string[] = [];

    if (this.filterData.startDate)
      parts.push(
        `From: <b>${this.datePipe.transform(this.filterData.startDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.endDate)
      parts.push(
        `To: <b>${this.datePipe.transform(this.filterData.endDate, 'dd MMM yyyy')}</b>`
      );

    return parts.join(', ');
  }

  onCLickClearAll() {
    this.filterOpened = false;
    this.filterApplied = false;
    this.filterForm.reset();
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.getCustomer();
  }

  onFilterData($event: any) {
    this.filterData = $event;
  }

  onFilterApply() {
    if (this.filterData?.startDate || this.filterData?.endDate) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.customers = [];
      this.from = this.filterData.startDate;
      this.to = this.filterData.endDate;
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getCustomer();
    } else {
      localStorage.removeItem('tripFilterData');
      this.filterApplied = false;
      this.loading = true;
      this.page = 0;
      this.size = 30;
      this.from = '';
      this.to = '';
      this.filterForm.reset();
      this.getCustomer();
    }
  }

  getPaymentTypeName(paymentType: string | undefined) {
    if (paymentType) {
      switch (paymentType) {
        case 'CASH':
          return 'Cash';
        case 'COMMISSION':
          return 'Commission';

        case 'INVOICE':
          return 'Invoice';
        default:
          return 'Cash & Invoice';
      }
    } else {
      return 'Not available';
    }
  }

  private getCustomerFromResolvedState() {
    this.activatedRoute.data.subscribe((data: any) => {
      const res = data.customer.data
      this.customers = res.data.content;
      this.totalPages = res.data.totalPages;
      this.loading = false;
    })
  }

  onClickCustomer(customerCode: string) {
    localStorage.setItem('selectedCustomerCode', customerCode);
    this.router.navigate(['profile/customer/customerCode/details'], {})
  }
}
