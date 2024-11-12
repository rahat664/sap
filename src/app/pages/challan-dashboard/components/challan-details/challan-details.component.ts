import { Component } from '@angular/core';
import { TripService } from '../../../trip-list/services/trip.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgForOf, NgIf, SlicePipe } from '@angular/common';
import { Trip } from '../../../auth/models/response/trip';

@Component({
  selector: 'app-challan-details',
  standalone: true,
  imports: [NgIf, DatePipe, NgForOf, RouterLink, SlicePipe],
  templateUrl: './challan-details.component.html',
  styleUrl: './challan-details.component.scss',
})
export class ChallanDetailsComponent {
  protected loadingEvents: any;
  protected unloadingEvents: any;
  loading: any;
  singleTrip: Trip = null;
  constructor(
    private trip: TripService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.trip
        .getAllTripEvent(params['id'], 'Loading')
        .subscribe((res: any) => {
          this.loadingEvents = res.data;
          this.loadingEvents = this.loadingEvents.filter(
            event => event.eventName === 'Upload loading challan'
          );
          console.log(this.loadingEvents);
        });
      this.trip
        .getAllTripEvent(params['id'], 'Unloading')
        .subscribe((res: any) => {
          this.unloadingEvents = res.data;
          this.unloadingEvents = this.unloadingEvents.filter(
            event => event.eventName === 'Upload unloading challan'
          );
          console.log(this.unloadingEvents);
        });
      this.trip.getTripDetailsByTripId(params['id']).subscribe((res: any) => {
        this.singleTrip = res.data;
      });
    });
  }

  getLoadingPoint(tripPoints: any) {
    if (tripPoints) {
      return tripPoints.filter(point => point.pointType === 'Loading');
    } else {
      return [];
    }
  }

  getUnloadingPoint(tripPoints: any) {
    if (tripPoints) {
      return tripPoints.filter(point => point.pointType === 'Unloading');
    } else {
      return [];
    }
  }

  getDueDays(singleTrip: Trip) {
    if (singleTrip) {
      const currentDate = new Date();
      const dueDate = new Date(singleTrip.tripStartDatetime);
      const diffTime = Math.abs(dueDate.getTime() - currentDate.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      return 0;
    }
  }

  getFirstSixDocuments(tripDocuments: any) {
    if (tripDocuments) {
      return tripDocuments.slice(0, 6);
    } else {
      return [];
    }
  }
}
