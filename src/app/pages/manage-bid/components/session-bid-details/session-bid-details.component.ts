import { Component, inject, Input } from '@angular/core';
import { Bid, SessionModel } from '../../models/session.model';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogDataComponent } from '../../../manage-trip/components/dialog-data/dialog-data.component';
import { TripService } from '../../../trip-list/services/trip.service';
import { FormsModule } from '@angular/forms';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { BidService } from '../../services/bid.service';
import { BidAcceptPopupComponent } from '../bid-accept-popup/bid-accept-popup.component';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-session-bid-details',
  imports: [
    DatePipe,
    DecimalPipe,
    NgForOf,
    NgIf,
    FormsModule,
    MatCheckbox,
    MatButton,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
  templateUrl: './session-bid-details.component.html',
  styleUrl: './session-bid-details.component.scss',
})
export class SessionBidDetailsComponent {
  readonly dialog = inject(MatDialog);
  @Input() sessionBid: SessionModel = {} as SessionModel;
  isInEditMode: boolean = false;
  selectedBidNumberOfTruck: number = 0;
  selectedBidAmount: number = 0;
  selectedBidReason: any;
  selectedBidReasonText: any;
  selectedBid: Bid;

  editBid(bid: Bid) {
    this.selectedBidNumberOfTruck = bid.submittedNumberOfTruck;
    this.selectedBidAmount = bid.amount;
    this.selectedBid = bid;
    this.isInEditMode = true;
  }

  acceptBid(bid: Bid) {
    const body = {
      id: bid.id,
      submittedNumberOfTruck: bid.submittedNumberOfTruck,
    };

    this.dialog
      .open(BidAcceptPopupComponent, {
        width: '37.25rem',
        data: {
          buttonText: 'Accept Bid',
          bid: bid,
          truckType: this.sessionBid?.truckType.split(',')[0].trim(),
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.bidService.acceptBid(body).subscribe({
            next: (res: any) => {
              if (res.status === 'OK') {
                this.dialog
                  .open(SuccessModalComponent, {
                    width: '30rem',
                    data: {
                      title: 'Bid Accepted',
                      text: `You have accepted the bid successfully `,
                      buttonText: 'Okay',
                    },
                  })
                  .afterClosed()
                  .subscribe(() => {
                    this.trip.reloadManageTripPage.next(true);
                  });
              } else {
                this.dialog.open(ErrorModalComponent, {
                  data: {
                    title: 'Bid Acceptance Failed',
                    text:
                      res.message ||
                      'Failed to accept the bid. Please try again.',
                    buttonText: 'Close',
                  },
                });
              }
            },
            error: err => {
              this.dialog.open(ErrorModalComponent, {
                data: {
                  title: 'Bid Acceptance Failed',
                  text:
                    err.error?.message ||
                    'Failed to accept the bid. Please try again.',
                  buttonText: 'Close',
                },
              });
            },
          });
        }
      });
  }

  constructor(
    private trip: TripService,
    private bidService: BidService
  ) {
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
