import { Component, HostListener, OnInit } from '@angular/core';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { StatusHeighlightComponent } from './components/status-heighlight/status-heighlight.component';
import { MonthWiseRevenueComponent } from './components/month-wise-revenue/month-wise-revenue.component';
import { ChallanStatusComponent } from './components/challan-status/challan-status.component';
import { TopTransporterComponent } from './components/top-transporter/top-transporter.component';
import { TopCustomerComponent } from './components/top-customer/top-customer.component';
import { Router } from '@angular/router';
import { TransporterRateAnalysisComponent } from './components/transporter-rate-analysis/transporter-rate-analysis.component';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { CustomInputSelectModel } from '../../shared/modules/custom-input/custom-input-select.model';
import { DateEnum } from '../trip-list/Enum/date.enum';
import { debounceTime, Subject } from 'rxjs';
import { CustomerService } from '../profiles/services/customer.service';
import { ToggleResponsiveService } from '../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { DashboardFilterComponent } from './components/dashboard-filter/dashboard-filter.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    GetElementHeightDirective,
    StatusHeighlightComponent,
    MonthWiseRevenueComponent,
    ChallanStatusComponent,
    TopTransporterComponent,
    TopCustomerComponent,
    TransporterRateAnalysisComponent,
    FormsModule,
    NgIf,
    DashboardFilterComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  height: any;
  filterOpened: boolean = false;
  dateOpened: boolean;
  inputPlaceholder: string = '';
  dateOptionArray: CustomInputSelectModel[];
  dateFilter: number = 0;
  fromDate: string;
  toDate: string;
  searchSubject = new Subject<string>();
  tripSuggestions: any[] = [];
  searchValue: any;
  customerCode: any[] = [];
  searchName: any;
  searchFilter: number = 0;
  selectedCompanies: any[] = [];
  isDateFilterAvailable: boolean;
  isCustomerFilterAvailable: boolean;
  paymentFilter: number = 0;
  paymentTypeValue: string = '';
  tripTypeFilter: number = 0;
  tripTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'PROJECT', selected: false, showname: 'Project Logistics' },
    {
      id: 2,
      value: 'COMMERCIAL',
      selected: false,
      showname: 'Commercial Logistics',
    },
  ];
  tripTypeValue: string;
  filterData: any;
  filterApplied: boolean;

  constructor(
    private customer: CustomerService,
    private datePipe: DatePipe,
    private router: Router,
  ) {
    this.searchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performSearch(searchText);
    });
  }

  ngOnInit() {
    localStorage.removeItem('tripFilterData');
    this.isCustomerFilterAvailable = false;
    this.isDateFilterAvailable = false;
    this.generateDateOptionsArray();
    // remove query params from the current route
    this.router.navigate([], {
      queryParams: {
        customerCode: null,
        fromDate: null,
        toDate: null,
        paymentType: null,
        tripType: null,
        truckTypeId: null,
      },
      queryParamsHandling: 'merge',
    });
    this.selectedCompanies = [];
    this.inputPlaceholder = '';
  }



  getFilterLength() {
    return (
      this.selectedCompanies.length +
      this.dateFilter +
      this.paymentFilter +
      this.tripTypeFilter
    );
  }

  performSearch(value: string) {
    if (value?.length > 0) {
      this.customer.searchCustomer(0, 100, value).subscribe((company: any) => {
        this.tripSuggestions = company.data.content;
        if (
          this.tripSuggestions.length > 0 &&
          this.selectedCompanies.length > 0
        ) {
          this.tripSuggestions = this.tripSuggestions.filter(
            suggestion =>
              !this.selectedCompanies.some(
                (selected: any) =>
                  selected.customerCode === suggestion.customerCode
              )
          );
        }
        if (this.tripSuggestions.length === 0) {
          this.tripSuggestions.push('No customer found');
        }
      });
    } else {
      this.resetSearch();
    }
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



  private resetSearch() {
    this.searchFilter = 0;
    this.customerCode = [];
    this.searchName = '';
    this.searchValue = '';
    this.tripSuggestions = [];
  }



  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }

  onFilterData($event: any) {
    this.filterData = $event;
  }

  onFilterApply() {
    if (
      this.filterData?.startDate ||
      this.filterData?.endDate ||
      this.filterData?.paymentType ||
      this.filterData?.tripType ||
      this.filterData?.customerCode?.length > 0 ||
      this.filterData?.truckType?.length > 0
    ) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.fromDate = this.filterData.startDate;
      this.toDate = this.filterData.endDate;
      this.customerCode = this.filterData.customerCode;
      this.paymentTypeValue = this.filterData.paymentType;
      this.tripTypeValue = this.filterData.tripType;
      this.router.navigate([], {
        queryParams: {
          fromDate: this.fromDate ? this.fromDate : null,
          toDate: this.toDate ? this.toDate : null,
          customerCode: this.customerCode?.toString() ? this.customerCode?.toString() : null,
          paymentType: this.paymentTypeValue ? this.paymentTypeValue : null,
          tripType: this.tripTypeValue ? this.tripTypeValue : null,
          truckTypeId: this.filterData?.truckType?.toString() ? this.filterData?.truckType?.toString() : null,
        },
        queryParamsHandling: 'merge',
      })
    } else {
      localStorage.removeItem('tripFilterData');
      this.filterApplied = false;
      this.customerCode = [];
      this.paymentTypeValue = '';
      this.tripTypeValue = '';
      this.fromDate = '';
      this.toDate = '';
      this.router.navigate([], {
        queryParams: {
          fromDate: null,
          toDate: null,
          customerCode: null,
          paymentType: null,
          tripType: null,
          truckTypeId: null,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  get filterSummary(): string {
    const parts: string[] = [];

    if (this.filterData.searchName)
      parts.push(`Company: <b>${this.filterData.searchName}</b>`);
    if (this.filterData.startDate)
      parts.push(
        `From: <b>${this.datePipe.transform(this.filterData.startDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.endDate)
      parts.push(
        `To: <b>${this.datePipe.transform(this.filterData.endDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.paymentType)
      parts.push(`Payment Type: <b>${this.filterData.paymentStatus}</b>`);
    if (this.filterData.tripType)
      parts.push(`Trip type: <b>${this.filterData.tripTypeName}</b>`);
    if (this.filterData?.customerCode?.length > 0) {
      parts.push(`Company: <b>${this.filterData.customerName?.toString()}</b>`);
    }
    if (this.filterData?.truckType?.length > 0) {
      parts.push(`Truck Type: <b>${this.filterData.selectedTruckValues?.toString()}</b>`);
    }

    return parts.join(', ');
  }

  onCLickClearAll() {
    localStorage.removeItem('tripFilterData');
    this.filterApplied = false;
    this.customerCode = [];
    this.paymentTypeValue = '';
    this.tripTypeValue = '';
    this.fromDate = '';
    this.toDate = '';
    this.router.navigate([], {
      queryParams: {
        fromDate: null,
        toDate: null,
        customerCode: null,
        paymentType: null,
        tripType: null,
        truckTypeId: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onClickFilterOpen() {
    this.filterOpened = true
  }
}
