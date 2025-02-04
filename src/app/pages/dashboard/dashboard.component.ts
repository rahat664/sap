import { Component, OnInit } from '@angular/core';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { StatusHeighlightComponent } from './components/status-heighlight/status-heighlight.component';
import { MonthWiseRevenueComponent } from './components/month-wise-revenue/month-wise-revenue.component';
import { LiveTripStatusComponent } from './components/live-trip-status/live-trip-status.component';
import { ChallanStatusComponent } from './components/challan-status/challan-status.component';
import { TopTransporterComponent } from './components/top-transporter/top-transporter.component';
import { TopCustomerComponent } from './components/top-customer/top-customer.component';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { RouterLink } from '@angular/router';
import { TransporterRateAnalysisComponent } from './components/transporter-rate-analysis/transporter-rate-analysis.component';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { FormsModule } from '@angular/forms';
import { GetClickEventDirective } from '../../shared/directive/get-click-event.directive';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgClass, NgForOf, NgIf } from '@angular/common';
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

  constructor(private customer: CustomerService) {
    this.searchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performSearch(searchText);
    });
  }

  ngOnInit() {
    this.generateDateOptionsArray();
  }

  getFilterLength() {
    return this.searchFilter + this.dateFilter;
  }

  onClearFilter() {
    this.dateOpened = false;
    this.isDateOpened = false;
    this.searchName = '';
    this.searchValue = '';
    this.customerCode = '';
    this.inputPlaceholder = '';
    this.tripSuggestions = [];
    this.dateFilter = 0;
    this.searchFilter = 0;
  }

  performSearch(value: string) {
    if (value?.length > 0) {
      this.customer.searchCustomer(0, 100, value).subscribe((company: any) => {
        this.tripSuggestions = company.data.content;
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
  }

  onSelectDate($event: number) {
    this.dateFilter = 1;
    if ($event === DateEnum.Custom) {
    } else {
    }
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
    })
    this.searchName = '';
    this.tripSuggestions = [];
  }

  onClickRemoveCompany(selectedCompany: any) {
    this.selectedCompanies = this.selectedCompanies.filter(
      company => company.customerCode !== selectedCompany.customerCode
    );
  }
}
