import { Component, Input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.scss',
})
export class TripCardComponent {
  @Input() tripNumber: string;
  @Input() companyName: string;
  @Input() tripStatus: string;
  @Input() tripStartDateTime: string;
  @Input() truckId: string;
  @Input() truckType: string;
  @Input() goodsName: string;
  @Input() loadingPoint: string;
  @Input() unloadingPoint: string;
  @Input() isActivated!: boolean;

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
}
