import { Component, inject, Input } from '@angular/core';
import { SessionModel } from '../../models/session.model';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogDataComponent } from '../../../manage-trip/components/dialog-data/dialog-data.component';
import { TripService } from '../../../trip-list/services/trip.service';
import { FormsModule } from '@angular/forms';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-session-bid-details',
  imports: [DatePipe, DecimalPipe, NgForOf, NgIf, FormsModule, MatCheckbox],
  templateUrl: './session-bid-details.component.html',
  styleUrl: './session-bid-details.component.scss',
})
export class SessionBidDetailsComponent {
  readonly dialog = inject(MatDialog);
  @Input() sessionBid: SessionModel = {} as SessionModel;
  isInEditMode: boolean = true;
  selectedBidNumberOfTruck: number = 0;
  selectedBidAmount: number = 0;
  selectedBidReason: any;
  selectedBidReasonText: any;

  editBid(bid) {}

  acceptBid(bid) {}

  constructor(private trip: TripService) {
    this.trip.reloadManageTripPage.subscribe(page => {
      if (page) {
        this.dialog.closeAll();
      }
    });
  }

  getBackgroundColor(
    amount: number,
    profitExpectation: number | undefined,
    customerRate: number | undefined
  ) {
    if (amount > customerRate) {
      return 'bg-red';
    } else if (amount <= profitExpectation) {
      return 'bg-green';
    } else {
      return 'bg-another';
    }
  }

  bookManually(availableTripId: string) {
    const dialogRef = this.dialog.open(DialogDataComponent, {
      width: '47.25rem',
      height: '52.25rem',
      data: {
        buttonName: 'Book Trip',
        trip: {
          tripId: availableTripId,
          status: 'Unassigned',
        },
      },
    });
  }

  onUpdateBid() {}

  onChangeReason($event: MatCheckboxChange) {
    if ($event.checked) {
      this.selectedBidReason = $event.source.value;
      if (this.selectedBidReason !== 'Others') {
        this.selectedBidReasonText = $event.source.value;
      } else {
        this.selectedBidReasonText = '';
      }
    } else {
      this.selectedBidReason = null;
      this.selectedBidReasonText = null;
    }
  }
}
