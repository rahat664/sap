import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { TripPoint } from '../../../pages/manage-trip/model/trip.details.model';

@Component({
  selector: 'app-trip-card',
  imports: [NgClass, DatePipe, NgIf],
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.scss',
})
export class TripCardComponent implements OnChanges {
  @Input() tripNumber: string;
  @Input() companyName: string;
  @Input() tripStatus: string;
  @Input() tripStartDateTime: string;
  @Input() truckId: string;
  @Input() truckType: string;
  @Input() goodsName: string;
  @Input() points: TripPoint[] = [];
  @Input() isActivated!: boolean;
  unloadingPoint: TripPoint[] = [];
  loadingPoint: TripPoint[] = [];

  getTripColorBasedOnStatus(tripStatus: string) {
    switch (tripStatus) {
      case 'Booked':
        return 'bg-another';
      case 'Completed':
        return 'bg-blue';
      case 'Running':
        return 'bg-green';
      case 'Unassigned':
        return 'bg-red';
      case 'Cancelled':
        return 'bg-cancel';
      default:
        return 'bg-another';
    }
  }

  ngOnChanges(simplesChanges: SimpleChanges) {
    if (simplesChanges['points']) {
      this.loadingPoint = this.points.filter(
        point => point.pointType === 'Loading'
      );
      this.unloadingPoint = this.points.filter(
        point => point.pointType === 'Unloading'
      );
    }
  }
}
