import { Component, EventEmitter, Output } from '@angular/core';
import { ChallanDashboardFilterComponent } from '../../../challan-dashboard/components/challan-dashboard-filter/challan-dashboard-filter.component';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { MatInput, MatSuffix } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { debounceTime, Subject } from 'rxjs';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { CustomerService } from '../../../profiles/services/customer.service';
import { TripService } from '../../../trip-list/services/trip.service';
import { UserService } from '../../../profiles/services/user.service';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { CustomerModel } from '../../../profiles/components/customer/model/customer.model';

@Component({
  selector: 'app-dashboard-filter',
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
    CustomInputComponent,
    GetClickEventDirective,
    MatAutocomplete,
    MatInput,
    MatAutocompleteTrigger,
    MatOption,
    MatSelect,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dashboard-filter.component.html',
  styleUrl: './dashboard-filter.component.scss',
})
export class DashboardFilterComponent {
  @Output() filterClosed: EventEmitter<void> = new EventEmitter();
  @Output() filterApplied: EventEmitter<any> = new EventEmitter();
  @Output() filterData: EventEmitter<any> = new EventEmitter();
  customerSearch: Subject<string> = new Subject<string>();
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
    {
      id: 0,
      value: '',
      selected: true,
      showname: 'All',
    },
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
    {
      id: 0,
      value: '',
      selected: true,
      showname: 'All',
    },
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

  constructor(
    private datePipe: DatePipe,
    private customer: CustomerService,
    private tripService: TripService,
    private transporter: UserService,
    private truck: TruckService
  ) {
    this.customerSearch.pipe().subscribe(searchText => {
      this.performCustomerSearch(searchText);
    });
  }

  ngOnInit() {
    this.getVehicleTypeList();
  }

  onClose() {
    this.filterClosed.emit();
  }

  onApplyFilter() {
    // emit the filter data and store it to local storage
    const filterData = {
      startDate: this.startDate,
      endDate: this.endDate,
      paymentType: this.paymentTypeOptionsArray.find(
        x => x.showname === this.paymentTypePlaceholder
      )?.value,
      paymentStatus: this.paymentTypePlaceholder,
      tripType: this.tripTypeOptionsArray.find(
        x => x.showname === this.tripTypePlaceholder
      )?.value,
      tripTypeName: this.tripTypePlaceholder,
      customerCode: this.customerCodes,
      customerName: this.customerNames,
      truckType: this.truckType,
      customers: this.customers,
      selectedButton: this.selectedButton,
      selectedTruckValues: this.selectedTruckValues,
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

  onSelectPayment($event: number) {
    this.paymentTypeOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.paymentTypePlaceholder =
      this.paymentTypeOptionsArray.find(x => x.id === $event)?.showname || '';
    this.paymentTypeValue =
      this.paymentTypeOptionsArray.find(x => x.id === $event)?.value || '';
  }

  onSelectTrip($event: number) {
    if (this.tripTypeFilter === 0) {
      this.filterLength += 1;
    }
    this.tripTypeFilter = 1;
    this.tripTypeOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.tripTypePlaceholder =
      this.tripTypeOptionsArray.find(x => x.id === $event)?.showname || '';
    this.tripTypeValue =
      this.tripTypeOptionsArray.find(x => x.id === $event)?.value || '';
  }

  onKeyUpCustomerSearch($event: KeyboardEvent) {
    const searchText = ($event.target as HTMLInputElement).value;
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

  private getVehicleTypeList() {
    this.tripService.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
      this.getDataFromLocalStorage();
    });
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
      this.paymentTypePlaceholder =
        tripFilterData?.paymentStatus === ''
          ? 'All'
          : tripFilterData?.paymentStatus;
      this.tripTypePlaceholder =
        tripFilterData?.tripType === '' ? 'All' : tripFilterData?.tripType;
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
      localStorage.removeItem('tripFilterData');
    }
  }
}
