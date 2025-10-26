import { Component, EventEmitter, Output } from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { CustomerService } from '../../../services/customer.service';
import { TripService } from '../../../../trip-list/services/trip.service';
import { UserService } from '../../../services/user.service';
import { CustomerModel } from '../../customer/model/customer.model';

@Component({
  selector: 'app-driver-filter',

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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './driver-filter.component.html',
  styleUrl: './driver-filter.component.scss',
})
export class DriverFilterComponent {
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
  statusOptionsArray: CustomInputSelectModel[] = [
    { id: 0, value: 'All', selected: false },
    { id: 1, value: 'Approved', selected: false },
    { id: 2, value: 'Pending', selected: false },
    { id: 3, value: 'Rejected', selected: false },
  ];
  statusInputPlaceholder: string
  hasDocumentsPlaceholder: string = '';
  hasDocumentsOptionsArray: CustomInputSelectModel[] = [
    {id: 0, value: 'True', selected: false, showname: 'Yes'},
    {id: 1, value: 'False', selected: false, showname: 'No'},
  ];

  onSelectStatus($event: number) {
    this.statusOptionsArray.forEach(option => {
      if (option.id === $event) {
        option.selected = !option.selected;
        if (option.selected && option.value !== 'All') {
          this.statusInputPlaceholder = option.value;
        } else {
          this.statusInputPlaceholder = 'All';
        }
      } else {
        option.selected = false;
      }
    });
  }

  hasDocumentSelect($event: number) {
    this.hasDocumentsOptionsArray.forEach(option => {
      if (option.id === $event) {
        option.selected = true;
        this.hasDocumentsPlaceholder = option.showname;
      } else {
        option.selected = false;
      }
    });
  }

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
    this.getDataFromLocalStorage();
  }

  onClose() {
    this.filterClosed.emit();
  }

  onApplyFilter() {
    // emit the filter data and store it to local storage
    const filterData = {
      startDate: this.startDate,
      endDate: this.endDate,
      statusInputPlaceholder: this.statusInputPlaceholder,
      selectedButton: this.selectedButton,
      hasDocument: this.hasDocumentsPlaceholder
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

  private getDataFromLocalStorage() {
    const tripFilterData = JSON.parse(localStorage.getItem('tripFilterData'));
    if (tripFilterData) {
      this.startDate = tripFilterData?.startDate;
      this.endDate = tripFilterData?.endDate;
      this.statusInputPlaceholder = tripFilterData?.statusInputPlaceholder;
      this.selectedButton = tripFilterData?.selectedButton;
      this.hasDocumentsPlaceholder = tripFilterData?.hasDocument;
      if (this.selectedButton) {
        this.dateText = true
      }
      localStorage.removeItem('tripFilterData');
    }
  }
}
