import { Component, Input, SimpleChanges } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { TripPoint } from '../../../manage-trip/model/trip.details.model';
import { SessionModel } from '../../models/session.model';

@Component({
  selector: 'app-bid-card',
  imports: [DatePipe, NgClass],
  templateUrl: './bid-card.component.html',
  styleUrl: './bid-card.component.scss',
})
export class BidCardComponent {
  @Input() sessionBid: SessionModel = {} as SessionModel;
  @Input() isActivated: boolean = false;

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

  }
}
