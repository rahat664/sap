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
import { TripData } from './model/trip.details.model';
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
import { LoadingComponent } from '../../shared/modules/loading/loading.component';

@Component({
  selector: 'app-manage-trip',
  standalone: true,
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
    LoadingComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './manage-trip.component.html',
  styleUrls: ['./manage-trip.component.scss'],
})
export class ManageTripComponent implements OnInit {
  tripList: Trip[] = [];
  startingPosition: { lng: number; lat: number };
  destinationPosition: { lng: number; lat: number };
  statusButtons = statusButtons;
  totalPages: number;
  page: number = 0;
  size: number = 20;
  status: string = '';
  loading: boolean = true;
  tripId: string;
  searchValue: string = '';
  singleTripDetails: TripData;
  activatedId: string;
  sidebarClosed: boolean;
  filterOpen: boolean = false;
  filterLength: number = 0;
  companySuggestions: any;
  customerCode: any = '';
  vehicleTypeList: any[];
  truckType: string = '';
  startDate: string;
  endDate: string;
  isTriggerFromParent: boolean;
  triggerFromParentName: string;
  truckLocationPosition: { lng: number; lat: number };
  anotherStatusCalled: boolean;
  previousFilterLength: number = 0;
  customerName: any;
  height: any;
  customerSelected: boolean;
  dateSelected: boolean;

  constructor(
    private tripService: TripService,
    private toggleMobileViewService: ToggleResponsiveService,
    private customer: CustomerService,
    private datePipe: DatePipe
  ) {}

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
        this.searchValue = '';
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
        this.customerCode,
        this.startDate,
        this.endDate,
        this.status,
        this.searchValue,
        this.truckType
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
    this.searchValue = (event.target as HTMLInputElement).value;
    if (this.searchValue.length > 2) {
      this.page = 0;
      this.tripService.anotherStatusCalled.next(true);
      this.getTripList();
    } else if (this.searchValue.length === 0) {
      this.page = 0;
      this.getTripList();
    }
  }

  getTruckRegistrationNumber(truck: Truck) {
    if (truck) {
      return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial}-${truck.registrationNum}`;
    } else {
      return 'Not Assigned';
    }
  }

  onclickTripCard(tripId: string, truckRegistrationNumber: string | string) {
    if (localStorage.getItem('expanded')) {
      localStorage.setItem('expanded', 'false');
    }
    this.activatedId = tripId;
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

  private tripStatusFilter(name: string) {
    this.page = 0;
    this.status = name === 'All' ? '' : name;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  private updateTripList(trip: any) {
    if (this.page === 0) {
      this.tripList = trip.data.responses;
      this.getTruckTrackers(this.tripList[0].truck?.fullRegistrationNumber);
      this.getTripDetails(this.tripList[0].tripId);
      this.activatedId = this.tripList[0].tripId;
    } else {
      this.tripList.push(...trip.data.responses);
    }
    this.totalPages = trip.data.totalPages;
    this.retriveStatusButtons(trip.data.statusCount);
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
          this.startingPosition = {
            lng: this.singleTripDetails?.tripPoints[0]?.pointLon,
            lat: this.singleTripDetails?.tripPoints[0]?.pointLat,
          };
          this.destinationPosition = {
            lng: this.singleTripDetails?.tripPoints[
              this.singleTripDetails.tripPoints.length - 1
            ]?.pointLon,
            lat: this.singleTripDetails?.tripPoints[
              this.singleTripDetails.tripPoints.length - 1
            ]?.pointLat,
          };
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
    if (target.value) {
      this.customer
        .searchCustomer(0, 1000, target.value, null)
        .subscribe((company: any) => {
          this.companySuggestions = company.data.content;
        });
    } else {
      this.companySuggestions = [];
    }
  }

  onClickCustomerSearchSuggestion(option: any) {
    this.customerCode = option.customerCode;
    this.customerName = option.name;
    if (!this.customerSelected) {
      this.filterLength += 1;
      this.previousFilterLength += 1;
    }
    this.customerSelected = true;
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
      if (this.dateSelected) {
        this.filterLength += 1;
        this.previousFilterLength += 1;
      }
      this.dateSelected = true;
    } else {
      this.endDate = '';
      this.filterLength -= 1;
      this.previousFilterLength -= 1;
    }
  }

  onChangeTruckType($event: any) {
    this.truckType = $event.value;
    this.filterLength = this.previousFilterLength + this.truckType?.length;
  }

  onClickApply() {
    this.filterOpen = false;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickClearAll() {
    this.filterLength = 0;
    this.startDate = '';
    this.endDate = '';
    this.truckType = '';
    this.customerCode = '';
    this.filterOpen = false;
    this.page = 0;
    this.tripService.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onChangeHeight($event: any) {
    this.tripService.bottomHeight.next($event);
  }

  private getTruckTrackers(truckRegistrationNumber: string) {
    if (truckRegistrationNumber) {
      this.tripService.getTrackerDetails(truckRegistrationNumber).subscribe(
        (res: any) => {
          this.truckLocationPosition = {
            lng: res.data?.longitude,
            lat: res.data?.latitude,
          };
        },
        error => {}
      );
    }
  }

  onClickClear() {
    this.customerSelected = false;
    this.dateSelected = false;
    this.searchValue = '';
    this.page = 0;
    this.size = 30;
    this.tripService.anotherStatusCalled.next(true);
    this.filterLength = 0;
    this.getTripList();
  }

  customizedHeight(height: any) {
    let heightValue = 0;
    if (height) {
      heightValue = height.split('px')[0];
    }
    return heightValue - 32 + 'px';
  }

  isAdmin() {
    return (
      localStorage.getItem('role').includes('ROLE_KAM') ||
      localStorage.getItem('role').includes('ROLE_ADMIN')
    );
  }
}
