import { Component, EventEmitter, Output } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { CustomInputComponent } from '../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../shared/modules/custom-input/custom-input-select.model';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { districts } from '../../../shared/models/ditrict-with-latlng.model';
import { debounceTime, Subject } from 'rxjs';
import { CustomerService } from '../../profiles/services/customer.service';
import { TripService } from '../../trip-list/services/trip.service';

@Component({
  selector: 'app-payment-filter',
  imports: [
    FormsModule,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatFormFieldModule,
    MatDateRangeInput,
    MatFormField,
    NgIf,
    NgForOf,
    CustomInputComponent,
    GetClickEventDirective,
    MatAutocomplete,
    MatInput,
    MatAutocompleteTrigger,
    MatOption,
    MatSelect,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './payment-filter.component.html',
  styleUrl: './payment-filter.component.scss',
})
export class PaymentFilterComponent {
  @Output() filterClosed: EventEmitter<void> = new EventEmitter<void>();
  buttonName: any[] = [
    'Today',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Custom',
  ];
  selectedButton: any;
  startDate: string;
  endDate: string;
  customSelected: boolean;
  dateSelected: boolean;
  dateText: any;
  customDateText: any;
  previousFilterLength: number;
  filterLength: number;
  paymentStatusPlaceholder: string;
  paymentStatusOptionsArray: CustomInputSelectModel[] = [
    {
      id: 1,
      value: '',
      selected: true,
      showname: 'All',
    },
    {
      id: 2,
      value: 'paid',
      selected: false,
      showname: 'Paid',
    },
    {
      id: 3,
      value: 'Partial',
      selected: false,
      showname: 'Partial',
    },
    {
      id: 4,
      value: 'unpaid',
      selected: false,
      showname: 'Unpaid',
    },
  ];
  searchId: any;
  tripIdSuggestions: any[] = [];
  tripId: any;
  tripStatusPlaceholder: string;
  tripStatusOptionsArray: CustomInputSelectModel[] = [
    {
      id: 1,
      value: '',
      selected: true,
      showname: 'All',
    },
    {
      id: 2,
      value: 'booked',
      selected: false,
      showname: 'Booked',
    },
    {
      id: 3,
      value: 'completed',
      selected: false,
      showname: 'Completed',
    },
    {
      id: 4,
      value: 'running',
      selected: false,
      showname: 'Running',
    },
  ];
  searchName: any;
  tripSuggestions: any;
  searchValue: any;
  @Output() filterApplied: EventEmitter<any> = new EventEmitter<any>();
  @Output() filterData: EventEmitter<any> = new EventEmitter<any>();
  searchSubject = new Subject<string>();
  customerSearchSubject = new Subject<string>();
  isSearchedMenuOpened: boolean;
  isTripSearchedMenuOpened: boolean;
  customerCode: string;
  picker: any;
  event: any;

  constructor(private datePipe: DatePipe, private customer: CustomerService, private trip: TripService) {
    this.searchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performSearch(searchText);
    });
    this.customerSearchSubject
      .pipe(debounceTime(1000))
      .subscribe(searchText => {
        this.performCustomerSearch(searchText);
      });
  }

  onApplyFilter() {
    const filterData = {
      startDate: this.startDate,
      endDate: this.endDate,
      paymentStatus: this.paymentStatusPlaceholder,
      tripStatus: this.tripStatusPlaceholder,
      tripId: this.tripId,
      searchName: this.searchName,
      customerCode: this.customerCode,
      searchId: this.searchId,
      loadingDistrict: this.loadingDistrict,
      unloadingDistrict: this.unloadingDistrict,
      selectedButton: this.selectedButton,
    }
    this.filterData.emit(filterData);
    localStorage.setItem('paymentFilter', JSON.stringify(filterData));
    this.filterApplied.emit();
    this.filterClosed.emit();
  }

  onClose() {
    this.filterClosed.emit();
  }

  onClickFilterButton(event: any, picker: any) {
    this.picker = picker;
    this.event = event;
    this.selectedButton = event;
    if (event === 'Custom') {
      this.startDate = '';
      this.endDate = '';
      this.customSelected = true;
      this.dateSelected = false;
      picker.open();
    } else {
      this.customSelected = false;
      this.dateText = event;
      picker.close();
      if (event === 'Today') {
        this.startDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.dateText = event;
      } else if (event === 'Last 7 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 7)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      } else if (event === 'Last 15 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 15)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      } else if (event === 'Last 30 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 30)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      }
    }
  }

  onChangeStartDate($event: Event) {
    this.startDate = ($event.target as HTMLInputElement).value;
    this.startDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
  }

  onChangeEndDate($event: any) {
    if ($event.target.value) {
      this.endDate = ($event.target as HTMLInputElement).value;
      this.endDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
      this.customDateText = `${this.startDate} - ${this.endDate}`;
      if (!this.dateSelected) {
        this.previousFilterLength += 1;
        this.filterLength += 1;
      }
      this.dateSelected = true;
    } else {
      this.endDate = '';
      if (this.dateSelected && this.filterLength > 1) {
        this.filterLength -= 1;
        this.previousFilterLength -= 1;
      }
    }
  }

  onSelectPayment($event: number) {
    this.paymentStatusOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.paymentStatusPlaceholder =
      this.paymentStatusOptionsArray.find(x => x.id === $event)?.showname || '';
  }

  onKeyUpTripSearch($event: any) {
    const value = $event.target.value;
    this.customerSearchSubject.next(value);
  }

  onClickTripSearchSuggestion(result: any) {
    this.tripId = result.tripId;
    this.searchId = result.tripId;
    this.tripIdSuggestions = [];
    this.isTripSearchedMenuOpened = false;
    this.trip.anotherStatusCalled.next(true);;
  }

  onClickClearTripId() {
    this.tripId = '';
    this.searchId = '';
    this.tripIdSuggestions = [];
    this.tripIdSuggestions.push('No trip found');
  }

  onSelectTripStatus($event: number) {
    this.tripStatusOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.tripStatusPlaceholder =
      this.tripStatusOptionsArray.find(x => x.id === $event)?.showname || '';
  }

  onSearchInputChange($event: any) {
    const value = $event.target.value;
    this.searchSubject.next(value); // Trigger the Subject when input changes
  }


  onClickSearchSuggestion(result: any) {
    this.customerCode = result.customerCode;
    this.searchName = result.name;
    this.searchValue = result.name;
    this.tripSuggestions = [];
    this.isSearchedMenuOpened = false;
    this.trip.anotherStatusCalled.next(true);
  }

  onClickClearCompany() {
    this.searchValue = '';
    this.searchName = '';
    this.tripSuggestions = [];
    this.tripSuggestions.push('No customer found');
  }

  protected districts = [];
  loadingDistrict: any;
  unloadingDistrict: any;

  onLoadingDistrictChange($event: MatSelectChange) {

  }

  onUnloadingDistrictChange($event: MatSelectChange) {

  }

  ngOnInit() {
    this.getDistrictList();
    const isFilter = localStorage.getItem('paymentFilter');
    if (isFilter) {
      const filterData = JSON.parse(isFilter);
      this.startDate = filterData.startDate;
      this.endDate = filterData.endDate;
      this.tripId = filterData.tripId;
      this.searchName = filterData.searchName;
      this.customerCode = filterData.customerCode;
      this.searchId = filterData.searchId;
      this.loadingDistrict = filterData.loadingDistrict;
      this.unloadingDistrict = filterData.unloadingDistrict;
      this.paymentStatusPlaceholder = filterData.paymentStatus;
      this.tripStatusPlaceholder = filterData.tripStatus;
      this.tripStatusOptionsArray.forEach(x => {
        if (x.value === filterData.tripStatus) {
          x.selected = true;
          this.tripStatusPlaceholder = x.showname;
        } else {
          x.selected = false;
        }
      });
      this.paymentStatusOptionsArray.forEach(x => {
        if (x.value === filterData.paymentStatus) {
          x.selected = true;
          this.paymentStatusPlaceholder = x.showname;
        } else {
          x.selected = false;
        }
      });
      this.selectedButton = filterData.selectedButton;
      if (this.selectedButton) {
        this.dateText = true
      }
    }
  }

  private getDistrictList() {
    this.trip.getDistricts().subscribe((res: any) => {
      this.districts = res.data;
    });
  }

  performSearch(value: string) {
    if (value?.length > 0) {
      this.customer.searchCustomer(0, 100, value).subscribe((company: any) => {
        this.tripSuggestions = company.data.content;
        if (this.tripSuggestions.length === 0) {
          this.tripSuggestions.push('No customer found');
        }
        this.isSearchedMenuOpened = true;
      });
    } else {
      this.resetSearch();
    }
  }

  resetSearch() {
    this.isSearchedMenuOpened = false;
    this.customerCode = '';
    this.searchValue = '';
    this.tripSuggestions = ['No customer found'];
    this.trip.anotherStatusCalled.next(true);
  }

  private performCustomerSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.trip.getTripSuggestions(searchText).subscribe((trip: any) => {
        this.tripIdSuggestions = trip.responses;
        if (this.tripIdSuggestions.length === 0) {
          this.tripIdSuggestions.push('No trip found');
        }
      });
    } else {
      this.resetTripIdSearch();
    }
  }

  private resetTripIdSearch() {
    this.isTripSearchedMenuOpened = false;
    this.tripId = '';
    this.tripIdSuggestions = [];
    this.tripIdSuggestions.push('No trip found');
    this.trip.anotherStatusCalled.next(true);
  }
}
