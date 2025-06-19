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
import { MatTooltip } from '@angular/material/tooltip';
import { Trip } from '../../../auth/models/response/trip';
import { TripData, TripPoint } from '../../../manage-trip/model/trip.details.model';

@Component({
  selector: 'app-session-bid-details',
  imports: [
    DecimalPipe,
    NgForOf,
    NgIf,
    FormsModule,
    MatCheckbox,
    DatePipe,
    MatMenu,
    MatMenuTrigger,
    MatButton,
    MatMenuItem,
  ],
  templateUrl: './session-bid-details.component.html',
  styleUrl: './session-bid-details.component.scss',
})
export class SessionBidDetailsComponent {
  readonly dialog = inject(MatDialog);
  @Input() sessionBid: SessionModel = {} as SessionModel;
  @Input() tripDetails: TripData = null;
  isInEditMode: boolean = false;
  selectedBidNumberOfTruck: number = 0;
  selectedBidAmount: number = 0;
  selectedBidReason: any;
  selectedBidReasonText: any;
  selectedBid: Bid;
  selectedBidReasonTextArea: string = '';
  otherSelected: boolean;
  selectedBidId: number = -1;
  isUpdatingBid: boolean = false;

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
          this.selectedBidId = bid.id;
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
                    this.selectedBidId = -1;
                  });
              } else {
                this.selectedBidId = -1;
                this.dialog
                  .open(ErrorModalComponent, {
                    data: {
                      title: 'Bid Acceptance Failed',
                      text:
                        res.message ||
                        'Failed to accept the bid. Please try again.',
                      buttonText: 'Close',
                    },
                  })
                  .afterClosed()
                  .subscribe(() => {
                    this.trip.reloadManageTripPage.next(false);
                  });
              }
            },
            error: err => {
              this.selectedBidId = -1;
              this.dialog
                .open(ErrorModalComponent, {
                  data: {
                    title: 'Bid Acceptance Failed',
                    text:
                      err.error?.message ||
                      'Failed to accept the bid. Please try again.',
                    buttonText: 'Close',
                  },
                })
                .afterClosed()
                .subscribe(() => {
                  this.trip.reloadManageTripPage.next(false);
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
    const profit = (customerRate || 0) - (amount || 0);
    // Calculate expected profit based on the profit expectation which is a percentage
    const expectedProfit =
      ((profitExpectation || 0) * (customerRate || 0)) / 100;

    if (profit >= expectedProfit) {
      return 'bg-green';
    } else if (profit < expectedProfit && profit >= 0) {
      return 'bg-another';
    } else {
      return 'bg-red';
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

  onUpdateBid() {
    this.isUpdatingBid = true;
    if (!this.selectedBid) {
      this.isUpdatingBid = false;
      this.dialog.open(ErrorModalComponent, {
        data: {
          title: 'Update Failed',
          text: 'No bid selected for update.',
          buttonText: 'Close',
        },
      });
      return;
    }

    const body = {
      id: this.selectedBid.id,
      submittedNumberOfTruck: this.selectedBidNumberOfTruck,
      amount: this.selectedBidAmount,
      remarks: this.selectedBidReasonText || this.selectedBidReason,
    };

    if (this.selectedBidReasonTextArea) {
      body.remarks =
        body.remarks + `\nOthers: ${this.selectedBidReasonTextArea}`;
    }

    this.bidService.updateBid(body).subscribe({
      next: (res: any) => {
        if (res.status === 'OK') {
          this.isUpdatingBid = false;
          this.dialog
            .open(SuccessModalComponent, {
              data: {
                title: 'Bid Updated',
                text: `You have updated the bid successfully `,
                buttonText: 'Okay',
              },
            })
            .afterClosed()
            .subscribe(() => {
              this.isInEditMode = false;
              this.selectedBid = null;
              this.selectedBidNumberOfTruck = 0;
              this.selectedBidAmount = 0;
              this.selectedBidReason = null;
              this.selectedBidReasonText = null;
              this.selectedBidReasonTextArea = null;
              this.trip.reloadManageTripPage.next(false);
              this.bidService.getSessionBidById(this.sessionBid.id).subscribe({
                next: (updatedSession: any) => {
                  this.sessionBid = updatedSession.data;
                },
                error: err => {
                  console.error('Error fetching updated session bid:', err);
                },
              });
            });
        } else {
          this.isUpdatingBid = false;
          this.dialog
            .open(ErrorModalComponent, {
              data: {
                title: 'Update Failed',
                text:
                  res.message || 'Failed to update the bid. Please try again.',
                buttonText: 'Close',
              },
            })
            .afterClosed()
            .subscribe(() => {
              this.isInEditMode = false;
              this.selectedBid = null;
              this.selectedBidNumberOfTruck = 0;
              this.selectedBidAmount = 0;
              this.selectedBidReason = null;
              this.selectedBidReasonText = null;
              this.selectedBidReasonTextArea = '';
              this.trip.reloadManageTripPage.next(false);
            });
        }
      },
      error: err => {
        this.isUpdatingBid = false;
        this.dialog
          .open(ErrorModalComponent, {
            data: {
              title: 'Update Failed',
              text:
                err.error?.message ||
                'Failed to update the bid. Please try again.',
              buttonText: 'Close',
            },
          })
          .afterClosed()
          .subscribe(() => {
            this.isInEditMode = false;
            this.selectedBid = null;
            this.selectedBidNumberOfTruck = 0;
            this.selectedBidAmount = 0;
            this.selectedBidReason = null;
            this.selectedBidReasonText = null;
            this.trip.reloadManageTripPage.next(false);
            this.selectedBidReasonTextArea = '';
          });
      },
    });
  }

  onChangeReason($event: MatCheckboxChange) {
    if ($event.checked) {
      this.selectedBidReason = $event.source.value;
      if (this.selectedBidReason !== 'Others') {
        // join the selected reason with a comma
        this.selectedBidReasonText = this.selectedBidReason
          ? this.selectedBidReasonText
            ? `${this.selectedBidReasonText}\n${this.selectedBidReason}`
            : this.selectedBidReason
          : '';
      } else {
        this.otherSelected = true;
      }
    } else {
      if ($event.source.value === 'Others') {
        this.otherSelected = false;
        this.selectedBidReasonText = this.selectedBidReason;
      } else {
        // remove the value from selected bid reason text
        this.selectedBidReasonText = this.selectedBidReasonText
          ? this.selectedBidReasonText
              .split('\n')
              .filter(reason => reason.trim() !== $event.source.value)
              .join('\n')
          : '';
      }
    }
  }

  getAcceptedBidFromBids(bids: Bid[] | undefined) {
    if (!bids || bids.length === 0) {
      return null;
    }
    const acceptedBid: Bid = bids.find(bid => bid.status === 'Accepted');
    // return array of accepted bids
    return acceptedBid ? [acceptedBid] : [];
  }

  getNotAcceptedBid(bids: Bid[] | undefined) {
    if (!bids || bids.length === 0) {
      return [];
    }
    const notAcceptedBids: Bid[] = bids.filter(
      bid => bid.status !== 'Accepted'
    );
    // return array of not accepted bids
    return notAcceptedBids ? notAcceptedBids : [];
  }

  getLoadingPoints(tripPoints: TripPoint[]) {
    return tripPoints
      ? tripPoints.filter(trip => trip.pointType === 'Loading')
      : [];
  }
  getUnLoadingPoints(tripPoints: TripPoint[]) {
    return tripPoints
      ? tripPoints.filter(trip => trip.pointType === 'Unloading')
      : [];
  }
}
