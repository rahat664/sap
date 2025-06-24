import { Component, OnInit } from '@angular/core';
import { TripCardComponent } from '../../shared/modules/trip-card/trip-card.component';
import { GMapComponent } from '../../shared/modules/g-map/g-map.component';
import { TripService } from '../trip-list/services/trip.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Trip, Truck } from '../auth/models/response/trip';
import { MapButtonsComponent } from './components/map-buttons/map-buttons.component';
import { statusButtons } from '../trip-list/models/status-buttons';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { ToggleResponsiveService } from '../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { TripDetailsComponent } from './components/trip-details/trip-details.component';
import { finalize } from 'rxjs/operators';
import { TripData, TripPoint } from './model/trip.details.model';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../profiles/services/customer.service';
import { MatSelect } from '@angular/material/select';
import { CustomerModel } from '../profiles/components/customer/model/customer.model';
import { debounceTime, Subject } from 'rxjs';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../shared/modules/custom-input/custom-input-select.model';

@Component({
  selector: 'app-manage-trip',
  imports: [
    TripCardComponent,
    GMapComponent,
    CommonModule,
    MapButtonsComponent,
    GiveMaxHeightDirective,
    GetElementHeightDirective,
    TripDetailsComponent,
    MatFormField,
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatDatepickerModule,
    MatFormFieldModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatInput,
    MatOption,
    ReactiveFormsModule,
    MatSelect,
    FormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './manage-trip.component.html',
  styleUrls: ['./manage-trip.component.scss'],
})
export class ManageTripComponent implements OnInit {
  searchSubject = new Subject<string>();
  tripList: Trip[] = [];
  startingPosition: { lng: number; lat: number }[] = [];
  destinationPosition: { lng: number; lat: number }[] = [];
  statusButtons = statusButtons;
  totalPages: number;
  page = 0;
  size = 30;
  status = '';
  loading = true;
  tripId: string;
  searchValue = '';
  singleTripDetails: TripData;
  activatedId: string;
  sidebarClosed: boolean;
  filterOpen = false;
  filterLength = 0;
  companySuggestions: any;
  customerCode: any = '';
  vehicleTypeList: any[];
  truckType: any;
  startDate: string;
  endDate: string;
  isTriggerFromParent: boolean;
  triggerFromParentName: string;
  truckLocationPosition: { lng: number; lat: number } = {} as any;
  anotherStatusCalled: boolean;
  previousFilterLength = 0;
  customerName: any;
  height: any;
  customerSelected: boolean;
  dateSelected: boolean;
  buttonName: any[] = [
    'Today',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Custom',
  ];
  customers: CustomerModel[] = [];
  selectedButton: any;
  filterHeight: any;
  filterValues: any[] = [];
  dateText: string;
  customDateText: string;
  customSelected: boolean;
  tripStatus: string;
  selectedTruckValues: any[] = [];
  customerCodes: string[] = [];
  customerNames: string[] = [];
  truckRegistrationNumbers: string;
  activatedTruckSizeInFeet = 0;
  truckerEnabled: boolean;
  paymentTypePlaceholder: string = '';
  paymentTypeValue: any[] = [];
  paymentFilter: number = 0;
  paymentTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'CASH', selected: false, showname: 'Cash' },
    { id: 2, value: 'INVOICE', selected: false, showname: 'Invoice' },
    { id: 3, value: 'CASH_AND_INVOICE', selected: false, showname: 'Cash & Invoice' },
    { id: 4, value: 'COMMISSION', selected: false, showname: 'Commission' },
  ];
  tripTypeFilter: number = 0;
  tripTypePlaceholder: string = '';
  tripTypeOptionsArray: CustomInputSelectModel[] = [
    {id: 1, value: 'PROJECT', selected: false, showname: 'Project Logistics'},
    {id: 2, value: 'COMMERCIAL', selected: false, showname: 'Commercial Logistics'},
  ];
  tripTypeValue: any[] = [];

  constructor(
    private tripService: TripService,
    private toggleMobileViewService: ToggleResponsiveService,
    private customer: CustomerService,
    private datePipe: DatePipe
  ) {
    this.searchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      if (searchText) {
        this.performSearch(searchText);
      } else {
        this.page = 0;
        this.size = 30;
        this.tripService.anotherStatusCalled.next(true);
        this.getTripList();
      }
    });
  }

  ngOnInit() {
    this.dateSelected = false;
    this.customerSelected = false;
    this.triggerFromParentName = 'All';
    this.isTriggerFromParent = false;
    if (localStorage.getItem('fromTripListTripId')) {
      this.tripId = localStorage.getItem('fromTripListTripId');
      this.getTripDetails(this.tripId);
      this.searchValue = this.tripId;
      this.getTruckTrackers(
        localStorage.getItem('fromTripListTruckRegistrationNumber')
      );
      localStorage.removeItem('fromTripListTripId');
      localStorage.removeItem('fromTripListTruckRegistrationNumber');
    }

    this.tripService.anotherStatusCalled.subscribe(value => {
      this.anotherStatusCalled = value;
    });

    this.getTripList();
    this.getVehicleTypeList();
    this.activatedId = null;
    localStorage.removeItem('tripId');
    this.tripService.reloadManageTripPage.subscribe(value => {
      if (value) {
        this.page = 0;
        this.size = 30;
        this.searchValue = '';
        // clear the filter values
        this.filterValues = [];
        this.selectedButton = '';
        this.startDate = '';
        this.endDate = '';
        this.dateText = '';
        this.customDateText = '';
        this.selectedTruckValues = [];
        this.truckType = '';
        this.customerCodes = [];
        this.customerNames = [];
        this.customers = [];
        this.customerSelected = false;
        this.filterLength = 0;
        this.previousFilterLength = 0;
        this.filterHeight = '0px';
        this.tripService.anotherStatusCalled.next(true);
        this.getTripList();
      }
    });
  }

  private getTripList() {
    this.page == 0 ? (this.loading = true) : (this.loading = false);
    this.tripService
      .getTrips(
        this.page,
        this.size,
        this.customerCodes?.toString(),
        this.startDate,
        this.endDate,
        this.status,
        this.searchValue,
        this.truckType?.toString(),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        this.paymentTypeValue?.toString(),
        this.tripTypeValue?.toString(),
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (trip: any) => {
          this.updateTripList(trip);
        },
        error => {
          this.loading = false;
        }
      );
  }

  onKeyUpSearch(event: KeyboardEvent) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  getTruckRegistrationNumber(truck: Truck) {
    if (truck) {
      return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial}-${truck.registrationNum}`;
    } else {
      return 'Not Assigned';
    }
  }

  onclickTripCard(
    tripId: string,
    truckRegistrationNumber: string,
    status: string,
    truckSizeInFeet: string
  ) {
    if (localStorage.getItem('expanded')) {
      localStorage.setItem('expanded', 'false');
    }
    this.tripStatus = status;
    this.activatedId = tripId;
    this.activatedTruckSizeInFeet = Number(truckSizeInFeet);
    this.getTripDetails(tripId);
    this.getTruckTrackers(truckRegistrationNumber);
  }

  private retriveStatusButtons(statusCount: any) {
    this.statusButtons.forEach(button => {
      button.count = statusCount[button.name];
    });
  }

  onClickButton(event: any) {
    this.tripStatusFilter(event.name);
  }

  onClickFilterButton(event: any, picker: any) {
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

  private tripStatusFilter(name: string) {
    this.page = 0;
    this.status = name === 'All' ? '' : name;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  private updateTripList(trip: any) {
    this.totalPages = trip.data.totalPages;
    this.retriveStatusButtons(trip.data.statusCount);
    if (this.page === 0) {
      this.tripList = trip.data.responses;
      this.getTruckTrackers(
        this.getTruckRegistrationNumber(this.tripList[0].truck)
      );
      this.getTripDetails(this.tripList[0].tripId);
      this.activatedId = this.tripList[0].tripId;
      this.tripStatus = this.tripList[0].status;
      this.activatedTruckSizeInFeet = Number(this.tripList[0].truckSize);
    } else {
      this.tripList.push(...trip.data.responses);
    }
  }

  onScrollEnd($event: boolean) {
    if (!$event) {
      this.tripService.anotherStatusCalled.next(false);
    }
    if ($event && this.page < this.totalPages - 1) {
      if (this.anotherStatusCalled) {
      } else {
        this.page++;
        this.size = 30;
        this.loading = false;
        this.getTripList();
      }
    }
  }

  onclickSideBarClose() {
    this.sidebarClosed = !this.sidebarClosed;
    this.toggleMobileViewService.isSidebarOpen.next(this.sidebarClosed);
  }

  private getTripDetails(tripId: string) {
    localStorage.setItem('tripId', tripId);
    if (tripId) {
      this.tripService.getTripDetailsByTripId(tripId).subscribe(
        (trip: any) => {
          this.singleTripDetails = trip.data;
          this.startingPosition = [];
          this.destinationPosition = [];
          // store starting and destination position
          this.singleTripDetails.tripPoints.forEach((point: TripPoint) => {
            if (point.pointType === 'Loading') {
              this.startingPosition.push({
                lng: point.pointLon,
                lat: point.pointLat,
              });
            } else if (point.pointType === 'Unloading') {
              this.destinationPosition.push({
                lng: point.pointLon,
                lat: point.pointLat,
              });
            }
          });
        },
        error => {}
      );
    }
  }

  onClickFold($event: boolean) {
    this.sidebarClosed = $event;
  }

  onKeyUpCustomerSearch($event: KeyboardEvent) {
    this.companySuggestions = [];
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.customer
        .searchCustomer(0, 1000, target.value, null)
        .subscribe((company: any) => {
          this.companySuggestions = company.data.content;
          if (this.customers.length > 0) {
            this.companySuggestions = this.companySuggestions.filter(
              (value: any) =>
                !this.customers.some(
                  (customer: any) => customer.id === value.id
                )
            );
          }
        });
    } else {
      this.companySuggestions = [];
    }
  }

  onClickCustomerSearchSuggestion(option: CustomerModel) {
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

  private getVehicleTypeList() {
    this.tripService.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
    });
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

  onChangeTruckType($event: any) {
    this.truckType = $event.value;
    this.filterLength = this.previousFilterLength + this.truckType?.length;
  }

  onChangeTripType($event: any) {
    this.tripTypeValue = $event.value;
    this.filterLength = this.previousFilterLength + this.tripTypeValue?.length;
  }

  onChangePaymentType($event: any) {
    this.paymentTypeValue = $event.value;
    this.filterLength = this.previousFilterLength + this.paymentTypeValue?.length;
  }

  onClickApply() {
    this.filterValues = [];
    this.selectedTruckValues = [];
    if (this.customerNames.length > 0) {
      this.customerNames.forEach((element: any) => {
        this.filterValues.push(element);
      });
    }
    if (this.dateSelected) {
      this.filterValues.push(
        this.customSelected ? this.customDateText : this.dateText
      );
      this.dateSelected = false;
    }
    if (this.truckType) {
      for (let i = 0; i < this.truckType.length; i++) {
        this.vehicleTypeList.forEach((element: any) => {
          if (element.id === this.truckType[i]) {
            this.selectedTruckValues.push(element.name);
            this.filterValues.push(element.name);
          }
        });
      }
    }

    if (this.tripTypeValue) {
      for (let i = 0; i < this.tripTypeValue.length; i++) {
        this.tripTypeOptionsArray.forEach((element: any) => {
          if (element.value === this.tripTypeValue[i]) {
            this.filterValues.push(element.showname);
          }
        });
      }
    }

    if (this.paymentTypeValue) {
      for (let i = 0; i < this.paymentTypeValue.length; i++) {
        this.paymentTypeOptionsArray.forEach((element: any) => {
          if (element.value === this.paymentTypeValue[i]) {
            this.filterValues.push(element.showname);
          }
        });
      }
    }
    this.page = 0;
    this.size = 30;
    this.filterOpen = false;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickClearAll() {
    this.dateSelected = false;
    this.customSelected = false;
    this.customerCodes = [];
    this.customerNames = [];
    this.customers = [];
    this.paymentTypeValue = [];
    this.paymentFilter = 0;
    this.dateText = '';
    this.filterValues = [];
    this.selectedButton = '';
    this.filterHeight = '0px';
    this.previousFilterLength = 0;
    this.filterLength = 0;
    this.startDate = '';
    this.endDate = '';
    this.truckType = '';
    this.customerCode = '';
    this.paymentTypePlaceholder = '';
    this.tripTypeValue = [];
    this.tripTypeFilter = 0;
    this.tripTypePlaceholder = '';
    this.filterOpen = false;
    this.page = 0;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onChangeHeight($event: any) {
    this.tripService.bottomHeight.next($event);
  }

  private getTruckTrackers(truckRegistrationNumber: string) {
    this.truckRegistrationNumbers = truckRegistrationNumber;
    if (truckRegistrationNumber) {
      this.tripService.getSensorData(truckRegistrationNumber).subscribe(
        (res: any) => {
          if (res.data) {
            this.truckerEnabled = true;
            this.truckLocationPosition = {
              lng: res.data?.lng,
              lat: res.data?.lat,
            };
          } else {
            this.truckerEnabled = false;
            this.truckLocationPosition = {
              lng: 0,
              lat: 0,
            };
          }
        },
        error => {
          this.truckerEnabled = false;
          this.truckLocationPosition = {
            lng: 0,
            lat: 0,
          };
        }
      );
    }
  }

  onClickClear() {
    this.searchValue = '';
    this.page = 0;
    this.size = 30;
    this.tripService.anotherStatusCalled.next(true);
    this.filterLength = 0;
    this.getTripList();
  }

  customizedHeight(height: any, customHeight: any) {
    let heightValue = 0;
    let customHeightValue = 0;
    if (height) {
      heightValue = height.split('px')[0];
    }
    if (customHeight) {
      customHeightValue = customHeight.split('px')[0];
    }
    const totalHeight =
      Number(heightValue) +
      Number(customHeightValue) -
      (customHeightValue > 0 ? 20 : 32);
    return totalHeight + 'px';
  }

  isAdmin() {
    return (
      localStorage.getItem('role').includes('ROLE_KAM') ||
      localStorage.getItem('role').includes('ROLE_ADMIN')
    );
  }

  onClickCloseFilter(filter: any) {
    this.dateSelected = false;
    this.filterValues = this.filterValues.filter(
      (value: any) => value !== filter
    );
    if (this.customerNames.includes(filter)) {
      const customerCode = this.customers.find(
        (element: any) => element.name === filter
      ).customerCode;
      this.customers = this.customers.filter(
        (value: any) => value.name !== filter
      );
      // find customer code from customer

      this.customerCodes = this.customerCodes.filter(
        (value: any) => value !== customerCode
      );
      this.customerNames = this.customerNames.filter(
        (value: any) => value !== filter
      );
      this.customerSelected = false;
      this.customerCode = '';
      this.previousFilterLength -= 1;
      this.customerName = '';
    } else if (filter === this.dateText) {
      this.selectedButton = '';
      this.dateSelected = false;
      this.startDate = '';
      this.endDate = '';
      this.previousFilterLength -= 1;
    } else if (filter === this.customDateText) {
      this.selectedButton = '';
      this.dateSelected = false;
      this.startDate = '';
      this.endDate = '';
      this.previousFilterLength -= 1;
    } else{
      const filterId = this.vehicleTypeList.find(
        (element: any) => element.name === filter
      )?.id;
      const tripFilterId = this.tripTypeOptionsArray.find(
        (element: any) => element.showname === filter
      )?.value;
      const paymentFilterId = this.paymentTypeOptionsArray.find(
        (element: any) => element.showname === filter
      )?.value;
      if (filterId) {
        this.truckType = this.truckType.filter(
          (value: any) => value !== filterId
        );
      } else if (tripFilterId) {
        this.tripTypeValue = this.tripTypeValue.filter(
          (value: any) => value !== filterId
        );
      } else if (paymentFilterId) {
        this.paymentTypeValue = this.paymentTypeValue.filter(
          (value: any) => value !== filterId
        );
      }
    }

    this.filterLength -= 1;
    if (this.filterLength === 0) {
      this.filterHeight = '0px';
    }
    this.page = 0;
    this.size = 30;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickFilterClose() {
    this.filterOpen = false;
  }

  onClickFilterOpen() {
    this.truckType = [];
    this.customers = [];
    this.selectedButton = '';
    this.startDate = '';
    this.endDate = '';
    this.dateText = '';
    this.customerCodes = [];
    this.customerNames = [];
    this.filterLength = 0;
    this.filterOpen = true;
    this.tripTypeValue = [];
    this.paymentTypeValue = [];

    if (this.filterValues.length > 0) {
      this.filterValues.forEach((element: any) => {
        const selectedVehicle = this.vehicleTypeList.find(
          (value: any) => value.name === element
        );

        if (selectedVehicle) {
          this.truckType.push(selectedVehicle.id);
        }

        else if (this.tripTypeOptionsArray.some(((value: any) => value.showname === element))) {
          this.tripTypeValue.push(
            this.tripTypeOptionsArray.find(
              (value: any) => value.showname === element
            ).value
          );
        }
        else if (this.paymentTypeOptionsArray.some(((value: any) => value.showname === element))) {
          this.paymentTypeValue.push(
            this.paymentTypeOptionsArray.find(
              (value: any) => value.showname === element
            ).value
          );
        }

        else if (this.buttonName.includes(element)) {
          this.selectedButton = element;
          this.dateText = element;
          this.dateSelected = true;
          if (element === 'Today') {
            this.startDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
            this.endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
          } else if (element === 'Last 7 Days') {
            this.startDate = this.datePipe.transform(
              new Date(new Date().setDate(new Date().getDate() - 7)),
              'yyyy-MM-dd'
            );
            // end date should be yesterday
            this.endDate = this.datePipe.transform(
              new Date(new Date().setDate(new Date().getDate() - 1)),
              'yyyy-MM-dd'
            );
          } else if (element === 'Last 15 Days') {
            this.startDate = this.datePipe.transform(
              new Date(new Date().setDate(new Date().getDate() - 15)),
              'yyyy-MM-dd'
            );
            // end date should be yesterday
            this.endDate = this.datePipe.transform(
              new Date(new Date().setDate(new Date().getDate() - 1)),
              'yyyy-MM-dd'
            );
          } else if (element === 'Last 30 Days') {
            this.startDate = this.datePipe.transform(
              new Date(new Date().setDate(new Date().getDate() - 30)),
              'yyyy-MM-dd'
            );
            // end date should be yesterday
            this.endDate = this.datePipe.transform(
              new Date(new Date().setDate(new Date().getDate() - 1)),
              'yyyy-MM-dd'
            );
          }
        } else if (element.includes('-')) {
          this.customSelected = true;
          this.customDateText = element;
          this.selectedButton = 'Custom';
          this.dateSelected = true;
          const dates = element.split(' - ');
          this.startDate = dates[0];
          this.endDate = dates[1];
        } else {
          this.customer.searchCustomer(0, 1000, element, null).subscribe(
            (res: any) => {
              this.customers.push(res.data.content[0]);
              this.customerCodes.push(res.data.content[0].customerCode);
              this.customerNames.push(res.data.content[0].name);
              this.customerSelected = true;
            },
            error => {}
          );
        }
      });
      this.filterLength = this.filterValues.length
    } else {
      this.truckType = [];
      this.selectedButton = '';
      this.dateSelected = false;
      this.startDate = '';
      this.endDate = '';
      this.customerNames = [];
      this.customerCodes = [];
      this.customers = [];
      this.customerSelected = false;
      this.filterLength = 0;
      this.previousFilterLength = 0;
      this.tripTypeValue = [];
      this.paymentTypeValue = [];
    }
  }

  onClearInput($event: boolean) {}

  private performSearch(searchText: string) {
    this.searchValue = searchText;
    this.page = 0;
    this.size = 30;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }




  onClickClosePaymentType() {
    this.paymentTypePlaceholder = '';
    this.paymentTypeValue = [];
    this.paymentFilter = 0;
    this.filterLength -= 1;
    this.page = 0;
    this.size = 30;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickCloseTripType() {
    this.tripTypePlaceholder = '';
    this.tripTypeValue = [];
    this.tripTypeFilter = 0;
    this.filterLength -= 1;
    this.page = 0;
    this.size = 30;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }
}
