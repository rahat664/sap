import { Component, OnInit } from '@angular/core';
import { TripCardComponent } from '../../shared/modules/trip-card/trip-card.component';
import { GMapComponent } from '../../shared/modules/g-map/g-map.component';
import { TripService } from '../trip-list/services/trip.service';
import { CommonModule } from '@angular/common';
import { Trip, Truck } from '../auth/models/response/trip';
import { MapButtonsComponent } from './components/map-buttons/map-buttons.component';
import { statusButtons } from '../trip-list/models/status-buttons';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { ToggleResponsiveService } from '../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { TripDetailsComponent } from './components/trip-details/trip-details.component';
import { finalize } from 'rxjs/operators';
import { TripData } from './model/trip.details.model';

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
  ],
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

  constructor(
    private tripService: TripService,
    private toggleMobileViewService: ToggleResponsiveService
  ) {}

  ngOnInit() {
    this.getTripList();
  }

  private getTripList() {
    this.page == 0 ? (this.loading = true) : (this.loading = false);
    this.tripService
      .getTrips(
        this.page,
        this.size,
        '',
        '',
        '',
        this.status,
        '',
        this.searchValue
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (trip: any) => {
          this.updateTripList(trip);
        },
        error => {
          console.error('Error fetching trips:', error);
          this.loading = false;
        }
      );
  }

  onKeyUpSearch(event: KeyboardEvent) {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.page = 0;
    this.getTripList();
  }

  getTruckRegistrationNumber(truck: Truck) {
    if (truck) {
      return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial} ${truck.registrationNum}`;
    } else {
      return 'Not Assigned';
    }
  }

  activatedId: string;
  sidebarClosed: boolean;

  onclickTripCard(tripId: string) {
    this.activatedId = tripId;
    this.getTripDetails(tripId);
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
    this.getTripList();
  }

  private updateTripList(trip: any) {
    if (this.page === 0) {
      this.tripList = trip.data.responses;
    } else {
      this.tripList.push(...trip.data.responses);
    }
    this.totalPages = trip.data.totalPages;
    this.retriveStatusButtons(trip.data.statusCount);
  }

  onScrollEnd() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.getTripList();
    }
  }

  onclickSideBarClose() {
    this.sidebarClosed = !this.sidebarClosed;
    this.toggleMobileViewService.isSidebarOpen.next(this.sidebarClosed);
  }

  private getTripDetails(tripId: string) {
    this.tripService.getTripDetailsByTripId(tripId).subscribe(
      (trip: any) => {
        this.singleTripDetails = trip.data;
        this.startingPosition = {
          lng: this.singleTripDetails.tripPoints[0].pointLon,
          lat: this.singleTripDetails.tripPoints[0].pointLat,
        };
        this.destinationPosition = {
          lng: this.singleTripDetails.tripPoints[
            this.singleTripDetails.tripPoints.length - 1
          ].pointLon,
          lat: this.singleTripDetails.tripPoints[
            this.singleTripDetails.tripPoints.length - 1
          ].pointLat,
        };
      },
      error => {
        console.error('Error fetching trip details:', error);
      }
    );
  }
}
