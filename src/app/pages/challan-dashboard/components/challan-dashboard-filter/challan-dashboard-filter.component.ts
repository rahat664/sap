import { Component, EventEmitter, Output } from '@angular/core';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { MatInput, MatSuffix } from '@angular/material/input';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { CustomerService } from '../../../profiles/services/customer.service';
import { TripService } from '../../../trip-list/services/trip.service';
import { UserService } from '../../../profiles/services/user.service';
import { CustomerModel } from '../../../profiles/components/customer/model/customer.model';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';

@Component({
  selector: 'app-challan-dashboard-filter',
  imports: [
    FormsModule,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    NgForOf,
    MatFormField,
    MatDatepickerModule,
    MatDatepickerToggle,
    NgIf,
    MatDateRangeInput,
    MatFormFieldModule,
    MatAutocomplete,
    MatInput,
    MatAutocompleteTrigger,
    MatOption,
    MatSelect,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './challan-dashboard-filter.component.html',
  styleUrl: './challan-dashboard-filter.component.scss',
})
export class ChallanDashboardFilterComponent {
  @Output() filterClosed: EventEmitter<void> = new EventEmitter();
  @Output() filterApplied: EventEmitter<any> = new EventEmitter();
  @Output() filterData: EventEmitter<any> = new EventEmitter();
  customerSearch: Subject<string> = new Subject<string>();
  transporterSearch: Subject<string> = new Subject<string>();
  tripIDSearchSubject: Subject<string> = new Subject<string>();
  tripIdSearch: Subject<string> = new Subject<string>();
  buttonName: any[] = [
    'Today',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Custom',
  ];
  picker: any;
  event: any;
  selectedButton: any;
  startDate: string;
  endDate: string;
  customSelected: boolean;
  dateSelected: boolean;
  dateText: any;
  customDateText: any;
  previousFilterLength: number = 0;
  filterLength: number = 0;
  paymentStatusPlaceholder: string = '';
  paymentTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'CASH', selected: false, showname: 'Cash' },
    { id: 2, value: 'INVOICE', selected: false, showname: 'Invoice' },
    {
      id: 3,
      value: 'CASH_AND_INVOICE',
      selected: false,
      showname: 'Cash & Invoice',
    },
    { id: 4, value: 'COMMISSION', selected: false, showname: 'Commission' },
  ];
  paymentTypePlaceholder: string = '';
  paymentTypeValue: string = '';
  tripTypePlaceholder: string = '';
  tripTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'PROJECT', selected: false, showname: 'Project Logistics' },
    {
      id: 2,
      value: 'COMMERCIAL',
      selected: false,
      showname: 'Commercial Logistics',
    },
  ];
  tripTypeFilter: number;
  tripTypeValue: string;
  customerName: any;
  customerCode: string;
  searchValue: string;
  companySuggestions: any[] = [];
  customerCodes: any[] = [];
  customers: any[] = [];
  customerNames: any[] = [];
  truckType: any;
  vehicleTypeList: any[] = [];
  transporterSuggestions: any[] = [];
  transporterName: string;
  searchTransporter: any;
  searchId: any;
  tripIdSuggestions: any = [];
  tripId: any;
  truckName: any;
  selectedTruckValues: any = [];
  truckSearchSubject = new Subject<string>();
  truckRegSuggestions: any[] = [];
   truckRegistrationId: string;
   searchRegistationId: any;
   selectedPaymentValue: any[] = [];
   selectedTripValue: any[] = [];

  constructor(
    private datePipe: DatePipe,
    private customer: CustomerService,
    private tripService: TripService,
    private transporter: UserService,
    private truck: TruckService
  ) {
    this.customerSearch
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(searchText => {
        this.performCustomerSearch(searchText);
      });
    this.transporterSearch
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(searchText => {
        this.performTransporterSearch(searchText);
      });
    this.tripIDSearchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(searchText => {
        this.performTripIdSearch(searchText);
      });
    this.truckSearchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(searchText => {
        this.performTruckSearch(searchText);
      });
  }

  ngOnInit() {
    this.getVehicleTypeList();
  }

  onClose() {
    this.filterClosed.emit();
  }
  private performTruckSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.truck.getTruckList(0, 100, searchText).subscribe((truck: any) => {
        this.truckRegSuggestions = truck.data.responses;
        if (this.truckRegSuggestions.length === 0) {
          this.truckRegSuggestions.push('No truck found');
        }
      });
    } else {
      this.resetTruckSearch();
    }
  }

  private resetTruckSearch() {
    this.truckRegistrationId = '';
    this.truckRegSuggestions = [];
    this.truckRegSuggestions.push('No truck found');
  }

  onApplyFilter() {
    // emit the filter data and store it to local storage
    const filterData = {
      startDate: this.startDate,
      endDate: this.endDate,
      paymentType: this.paymentTypeValue,
      tripType: this.tripTypeValue,
      customerCode: this.customerCodes,
      customerName: this.customerNames,
      truckType: this.truckType,
      customers: this.customers,
      transporterName: this.transporterName,
      tripId: this.tripId,
      selectedButton: this.selectedButton,
      selectedTruckValues: this.selectedTruckValues,
      truckRegistrationId: this.truckRegistrationId,
      selectedPaymentValue: this.selectedPaymentValue,
      selectedTripValue: this.selectedTripValue,
    };
    localStorage.setItem('tripFilterData', JSON.stringify(filterData));
    this.filterData.emit(filterData);
    this.filterApplied.emit(true);
    this.filterClosed.emit();
    this.updateOverLayStyle(false);
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


  onKeyUpCustomerSearch($event: KeyboardEvent) {
    const searchText = ($event.target as HTMLInputElement).value?.trim() || '';
    this.searchValue = searchText;
    this.customerSearch.next(searchText);
  }

  private performCustomerSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.customer
        .searchCustomer(0, 100, searchText)
        .subscribe((company: any) => {
          this.companySuggestions = company.data.content;
          // remove selected customers from the suggestions
          this.companySuggestions = this.companySuggestions?.filter(
            (company: any) =>
              !this.customerCodes?.includes(company.customerCode)
          );
          if (this.companySuggestions.length === 0) {
            this.companySuggestions.push('No customer found');
          }
        });
    } else {
      this.resetSearch();
    }
  }

  resetSearch() {
    this.customerCode = '';
    this.searchValue = '';
    this.companySuggestions = ['No customer found'];
  }

  onClickCustomerSearchSuggestion(option: any) {
    this.customers.push(option);
    this.customerCodes?.push(option.customerCode);
    this.customerNames?.push(option.name);
    this.customerName = '';
    this.filterLength += 1;
    this.previousFilterLength += 1;
  }

  customerIsNotEnterprise() {
    return localStorage.getItem('enterpriseCode') !== 'E-3'
  }

  onClickCloseCustomer(customer: CustomerModel) {
    this.filterLength -= 1;
    this.previousFilterLength -= 1;
    this.customerCodes = this.customerCodes?.filter(
      (value: any) => value !== customer.customerCode
    );
    this.customerNames = this.customerNames?.filter(
      (value: any) => value !== customer.name
    );
    this.customers = this.customers?.filter(
      (value: any) => value.id !== customer.id
    );
  }

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }

  onChangeTruckType($event: any) {
    this.selectedTruckValues = [];
    this.truckType = $event.value;
    if (this.truckType) {
      for (let i = 0; i < this.truckType.length; i++) {
        this.vehicleTypeList.forEach((element: any) => {
          if (element.id === this.truckType[i]) {
            this.selectedTruckValues.push(element.name);
          }
        });
      }
    } else {
      this.selectedTruckValues = [];
    }
    this.filterLength = this.previousFilterLength + this.truckType?.length;
  }

  onChangePaymentType($event: any) {
    this.selectedPaymentValue = [];
    this.paymentTypeValue = $event.value;
    if (this.paymentTypeValue) {
      for (let i = 0; i < this.paymentTypeValue.length; i++) {
        this.paymentTypeOptionsArray.forEach((element: any) => {
          if (element.value === this.paymentTypeValue[i]) {
            this.selectedPaymentValue.push(element.showname);
          }
        });
      }
    } else {
      this.selectedPaymentValue = [];
    }
  }
  onChangeTripType($event: any) {
    this.selectedTripValue = [];
    this.tripTypeValue = $event.value;
    if (this.tripTypeValue) {
      for (let i = 0; i < this.tripTypeValue.length; i++) {
        this.tripTypeOptionsArray.forEach((element: any) => {
          if (element.value === this.tripTypeValue[i]) {
            this.selectedTripValue.push(element.showname);
          }
        });
      }
    } else {
      this.selectedTripValue = [];
    }
  }

  private getVehicleTypeList() {
    this.tripService.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
      this.getDataFromLocalStorage();
    });
  }

  onKeyUpTransporterSearch($event: KeyboardEvent) {
    const searchText = ($event.target as HTMLInputElement).value?.trim() || '';
    this.transporterSearch.next(searchText);
  }

  private performTransporterSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.transporter
        .getTransporter(0, 100, searchText)
        .subscribe((transporter: any) => {
          this.transporterSuggestions = transporter.data;
          if (this.transporterSuggestions.length === 0) {
            this.transporterSuggestions.push('No transporter found');
          }
        });
    } else {
      this.resetTransporterSearch();
    }
  }

  private resetTransporterSearch() {
    this.transporterName = '';
    this.transporterName = '';
    this.transporterSuggestions = [];
    this.transporterSuggestions.push('No transporter found');
  }

  onClickTransporterSearchSuggestion(result: any) {
    this.transporterName = result.name;
    this.searchTransporter = result.name;
    this.transporterSuggestions = [];
  }

  onClickClearTransporter() {
    this.transporterName = '';
    this.searchTransporter = '';
    this.transporterSuggestions = [];
  }

  onKeyUpTripSearch($event: any) {
    const value = ($event.target as HTMLInputElement).value?.trim() || '';
    this.tripIDSearchSubject.next(value); // Trigger the Subject when input changes
  }

  onClickTripSearchSuggestion(option: any) {
    this.tripId = option.tripId;
    this.searchId = option.tripId;
    this.tripIdSuggestions = [];
  }

  onClickClearTripId() {
    this.tripId = '';
    this.searchId = '';
    this.tripIdSuggestions = [];
  }

  private performTripIdSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.tripService.getTripSuggestions(searchText).subscribe((trip: any) => {
        this.tripIdSuggestions = trip.responses;
        if (this.tripIdSuggestions.length === 0) {
          this.tripIdSuggestions.push('No trip id found');
        }
      });
    } else {
      this.resetTripIdSearch();
    }
  }

  private resetTripIdSearch() {
    this.tripId = '';
    this.tripIdSuggestions = [];
    this.tripIdSuggestions.push('No trip id found');
  }

  onClickTruckSearchSuggestion(result: any) {
    this.truckRegistrationId = result.fullRegistrationNumber;
    this.searchRegistationId = result.fullRegistrationNumber;
    this.truckRegSuggestions = [];
  }

  onKeyUpTruckSearch($event: any) {
    const value = ($event.target as HTMLInputElement).value?.trim() || '';
    this.truckSearchSubject.next(value); // Trigger the Subject when input changes
  }

  private getDataFromLocalStorage() {
    const tripFilterData = JSON.parse(localStorage.getItem('tripFilterData'));
    if (tripFilterData) {
      this.startDate = tripFilterData?.startDate;
      this.endDate = tripFilterData?.endDate;
      this.selectedButton = tripFilterData?.selectedButton;
      if (this.selectedButton) {
        this.dateText = true;
      }
      if (tripFilterData?.customerCode?.length > 0) {
        this.customerCodes = tripFilterData?.customerCode;
        this.customerNames = tripFilterData?.customerName;
        this.customers = tripFilterData?.customers;
      }
      this.customers = tripFilterData?.customers || [];
      if (tripFilterData?.truckType?.length > 0) {
        this.truckType = tripFilterData?.truckType;
        if (this.truckType) {
          for (let i = 0; i < this.truckType.length; i++) {
            this.vehicleTypeList.forEach((element: any) => {
              if (element.id === this.truckType[i]) {
                this.selectedTruckValues.push(element.name);
              }
            });
          }
        }
      }

      if (tripFilterData?.paymentType?.length > 0) {
        this.paymentTypeValue = tripFilterData?.paymentType;
        if (this.paymentTypeValue) {
          for (let i = 0; i < this.paymentTypeValue.length; i++) {
            this.paymentTypeOptionsArray.forEach((element: any) => {
              if (element.value === this.paymentTypeValue[i]) {
                this.selectedPaymentValue.push(element.showname);
              }
            });
          }
        }
      }

      if (tripFilterData?.tripType?.length > 0) {
        this.tripTypeValue = tripFilterData?.tripType;
        if (this.tripTypeValue) {
          for (let i = 0; i < this.tripTypeValue.length; i++) {
            this.tripTypeOptionsArray.forEach((element: any) => {
              if (element.value === this.tripTypeValue[i]) {
                this.selectedTripValue.push(element.showname);
              }
            });
          }
        }
      }
      this.transporterName = tripFilterData?.transporterName;
      this.searchTransporter = tripFilterData?.transporterName;
      this.tripId = tripFilterData?.tripId;
      this.searchId = tripFilterData?.tripId;
      this.truckRegistrationId = tripFilterData?.truckRegistrationId;
      this.searchRegistationId = tripFilterData?.truckRegistrationId;
      localStorage.removeItem('tripFilterData');
    }
  }

  onClickClearTruckReg() {
    this.truckRegistrationId = '';
    this.searchRegistationId = '';
    this.truckRegSuggestions = [];
  }
}
