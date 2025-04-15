import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { Subject } from 'rxjs';
import { CustomerService } from '../../../profiles/services/customer.service';
import { CustomerModel } from '../../../profiles/components/customer/model/customer.model';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { TripService } from '../../services/trip.service';
import { UserService } from '../../../profiles/services/user.service';

@Component({
  selector: 'app-trip-list-filter',
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
  templateUrl: './trip-list-filter.component.html',
  styleUrl: './trip-list-filter.component.scss',
})
export class TripListFilterComponent {
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

  constructor(
    private datePipe: DatePipe,
    private customer: CustomerService,
    private tripService: TripService,
    private transporter: UserService
  ) {
    this.customerSearch.pipe().subscribe(searchText => {
      this.performCustomerSearch(searchText);
    });
    this.transporterSearch.pipe().subscribe(searchText => {
      this.performTransporterSearch(searchText);
    });
    this.tripIDSearchSubject.pipe().subscribe(searchText => {
      this.performTripIdSearch(searchText);
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
      paymentStatus: this.paymentStatusPlaceholder,
      tripType: this.tripTypePlaceholder,
      customerCode: this.customerCodes,
      customerName: this.customerNames,
      truckType: this.truckType,
      transporterName: this.transporterName,
      tripId: this.tripId,
    };
    localStorage.setItem('filterData', JSON.stringify(filterData));
    this.filterApplied.emit(true);
    this.filterData.emit(filterData);
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
    this.paymentStatusOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.paymentStatusPlaceholder =
      this.paymentStatusOptionsArray.find(x => x.id === $event)?.showname || '';
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
          this.companySuggestions = this.companySuggestions.filter(
            (company: any) => !this.customerCodes.includes(company.customerCode)
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
    this.customerCodes.push(option.customerCode);
    this.customerNames.push(option.name);
    this.customerName = '';
    this.filterLength += 1;
    this.previousFilterLength += 1;
  }

  onClickCloseCustomer(customer: CustomerModel) {
    this.filterLength -= 1;
    this.previousFilterLength -= 1;
    this.customerCodes = this.customerCodes.filter(
      (value: any) => value !== customer.customerCode
    );
    this.customerNames = this.customerNames.filter(
      (value: any) => value !== customer.name
    );
    this.customers = this.customers.filter(
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
    this.truckType = $event.value;
    this.filterLength = this.previousFilterLength + this.truckType?.length;
  }

  private getVehicleTypeList() {
    this.tripService.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
    });
  }

  onKeyUpTransporterSearch($event: KeyboardEvent) {
    const searchText = ($event.target as HTMLInputElement).value;
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
    const value = $event.target.value;
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
}
