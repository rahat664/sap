import { Component, HostListener, OnInit } from '@angular/core';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { StatusHeighlightComponent } from './components/status-heighlight/status-heighlight.component';
import { MonthWiseRevenueComponent } from './components/month-wise-revenue/month-wise-revenue.component';
import { ChallanStatusComponent } from './components/challan-status/challan-status.component';
import { TopTransporterComponent } from './components/top-transporter/top-transporter.component';
import { TopCustomerComponent } from './components/top-customer/top-customer.component';
import { Router } from '@angular/router';
import { TransporterRateAnalysisComponent } from './components/transporter-rate-analysis/transporter-rate-analysis.component';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { FormsModule } from '@angular/forms';
import { GetClickEventDirective } from '../../shared/directive/get-click-event.directive';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { CustomInputSelectModel } from '../../shared/modules/custom-input/custom-input-select.model';
import { DateEnum } from '../trip-list/Enum/date.enum';
import { debounceTime, Subject } from 'rxjs';
import { CustomerService } from '../profiles/services/customer.service';

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
    CustomInputComponent,
    FormsModule,
    GetClickEventDirective,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    NgIf,
    NgClass,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  height: any;
  filterOpened: boolean = true;
  isDateOpened: boolean;
  dateOpened: boolean;
  inputPlaceholder: string = '';
  dateOptionArray: CustomInputSelectModel[];
  dateFilter: number = 0;
  fromDate: string;
  toDate: string;
  searchSubject = new Subject<string>();
  tripSuggestions: any[] = [];
  searchValue: any;
  customerCode: any;
  searchName: any;
  searchFilter: number = 0;
  selectedCompanies: any[] = [];
  isDateFilterAvailable: boolean;
  isCustomerFilterAvailable: boolean;
  paymentTypePlaceholder: string = '';
  paymentTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'CASH', selected: false, showname: 'Cash' },
    { id: 2, value: 'INVOICE', selected: false, showname: 'Invoice' },
    { id: 3, value: 'CASH_AND_INVOICE', selected: false, showname: 'Cash & Invoice' },
    { id: 4, value: 'COMMISSION', selected: false, showname: 'Commission' },
  ];
  paymentFilter: number = 0;
  paymentTypeValue: string = '';

  constructor(
    private customer: CustomerService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.searchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performSearch(searchText);
    });
  }

  ngOnInit() {
    this.isCustomerFilterAvailable = false;
    this.isDateFilterAvailable = false;
    this.generateDateOptionsArray();
    // remove query params from the current route
    this.router.navigate([], {
      queryParams: {
        customerCode: null,
        fromDate: null,
        toDate: null,
      },
      queryParamsHandling: 'merge',
    });
    this.selectedCompanies = [];
    this.inputPlaceholder='';
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.onClearFilter();
  }

  getFilterLength() {
    return this.selectedCompanies.length + this.dateFilter + this.paymentFilter;
  }

  onClearFilter() {
    this.dateOpened = false;
    this.isDateOpened = false;
    this.searchName = '';
    this.searchValue = '';
    this.customerCode = '';
    this.inputPlaceholder = '';
    this.paymentTypePlaceholder = '';
    this.tripSuggestions = []
    this.paymentTypeValue = '';
    this.dateFilter = 0;
    this.searchFilter = 0;
    this.paymentFilter = 0;
    this.isCustomerFilterAvailable = false;
    this.selectedCompanies = [];
    this.isDateFilterAvailable = false;
    this.router.navigate([], {
      queryParams: {
        customerCode: null,
        fromDate: null,
        toDate: null,
        paymentType: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  performSearch(value: string) {
    if (value?.length > 0) {
      this.customer.searchCustomer(0, 100, value).subscribe((company: any) => {
        this.tripSuggestions = company.data.content;
        if (this.tripSuggestions.length > 0 && this.selectedCompanies.length > 0) {
          this.tripSuggestions = this.tripSuggestions.filter(
            (suggestion) =>
              !this.selectedCompanies.some((selected: any)=> selected.customerCode === suggestion.customerCode)
          )
        }
        if (this.tripSuggestions.length === 0) {
          this.tripSuggestions.push('No customer found');
        }
      });
    } else {
      this.resetSearch();
    }
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
    this.dateOpened = false;
    this.isDateOpened = false;
  }

  onSelectedFromDate($event: string) {
    this.fromDate = $event;
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

  onSelectedToDate($event: string) {
    this.toDate = $event;
    this.dateOpened = false;
    this.isDateOpened = false;
    this.isDateFilterAvailable = true;
  }

  onSelectDate($event: number) {
    this.dateFilter = 1;
    if ($event === DateEnum.Custom) {
      this.isDateFilterAvailable = false;
    } else {
      this.inputPlaceholder =
        this.dateOptionArray.find(x => x.id === $event)?.value || '';
      this.dateOptionArray.forEach(x => (x.selected = x.id === $event));
      this.setDateRange($event);
      this.isDateFilterAvailable = true;
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
    this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd') || '';
    this.toDate = this.datePipe.transform(toDate, 'yyyy-MM-dd') || '';
    // set query params to the current route
    this.router.navigate([], {
      queryParams: {
        fromDate: this.fromDate,
        toDate: this.toDate,
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearchInputChange($event: any) {
    const value = $event.target.value;
    this.searchSubject.next(value); // Trigger the Subject when input changes
  }

  private resetSearch() {
    this.searchFilter = 0;
    this.customerCode = '';
    this.searchName = '';
    this.searchValue = '';
    this.tripSuggestions = [];
  }

  onClickClearCompany() {
    this.searchFilter = 0;
    this.customerCode = '';
    this.searchName = '';
    this.searchValue = '';
    this.tripSuggestions = [];
  }

  onClickSearchSuggestion(option: any) {
    this.searchFilter = 1;
    this.selectedCompanies.push({
      customerCode: option.customerCode,
      name: option.name,
    });
    this.searchName = '';
    this.tripSuggestions = [];
    this.searchValue = '';
    // set query params to the current route
    this.router.navigate([], {
      queryParams: {
        customerCode: this.selectedCompanies
          .map(company => company.customerCode)
          .join(','),
      },
      queryParamsHandling: 'merge',
    });
  }

  onClickRemoveCompany(selectedCompany: any) {
    this.selectedCompanies = this.selectedCompanies.filter(
      company => company.customerCode !== selectedCompany.customerCode
    );
    // set query params to the current route
    this.router.navigate([], {
      queryParams: {
        customerCode: this.selectedCompanies
          .map(company => company.customerCode)
          .join(','),
      },
      queryParamsHandling: 'merge',
    });
  }

  onDateEmited($event: boolean) {
    if ($event) {
      this.router.navigate([], {
        queryParams: {
          fromDate: this.fromDate,
          toDate: this.toDate,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  onSelectPayment($event: number) {
    this.paymentFilter = 1;
    this.paymentTypeOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.paymentTypePlaceholder =
      this.paymentTypeOptionsArray.find(x => x.id === $event)?.showname || '';
    this.paymentTypeValue = this.paymentTypeOptionsArray.find(x => x.id === $event)?.value || '';
    // set query params to the current route
    this.router.navigate([], {
      queryParams: {
        paymentType: this.paymentTypeValue,
      },
      queryParamsHandling: 'merge',
    });

  }
}
