import { Component, inject, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { TripService } from '../../../trip-list/services/trip.service';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';

class DialogData {}

@Component({
  selector: 'app-confirm-update',
  standalone: true,
  imports: [],
  templateUrl: './confirm-update.component.html',
  styleUrl: './confirm-update.component.scss',
})
export class ConfirmUpdateComponent {
  readonly dialog = inject(MatDialog);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmUpdateComponent>,
    private trip: TripService,
    private datePipe: DatePipe
  ) {}

  closeDialog() {
    this.dialogRef.close(false);
  }

  ngOnInit() {}

  confirmUpdate() {
    if (
      this.data.buttonText != 'Update' &&
      this.data.buttonText != 'Inactive' &&
      this.data.buttonText != 'Active' &&
      this.data.buttonText != 'Removed'
    ) {
      const body = {};
      if (this.data?.trip?.status == 'Booked') {
        body['tripStartedAt'] = this.datePipe.transform(
          new Date(),
          'yyyy-MM-ddTHH:mm:ss'
        );
      } else {
        body['tripEndedAt'] = this.datePipe.transform(
          new Date(),
          'yyyy-MM-ddTHH:mm:ss'
        );
      }
      this.trip.updateTrip(body, this.data.trip.tripId).subscribe(
        (res: any) => {
          this.dialogRef.close('updated');
          if (res.status == 'OK') {
            this.dialog
              .open(SuccessModalComponent, {
                width: '21.375rem',
                data: {
                  title: 'Success',
                  text: `Your Trip has ${this.data.trip.status == 'Booked' ? 'started' : 'completed'}. Your trip no is ${res.data.tripId}`,
                  buttonText: 'Okay',
                },
              })
              .afterClosed()
              .subscribe(() => {
                this.trip.reloadManageTripPage.next(true);
              });
          } else if (res.status == 'Bad Request') {
            this.dialogRef.close('error');
            this.dialog.open(ErrorModalComponent, {
              width: '21.375rem',
              data: {
                title: 'Error',
                text: res.message,
                buttonText: 'Okay',
              },
            });
          }
        },
        err => {
          this.dialogRef.close('error');
          this.dialog.open(ErrorModalComponent, {
            width: '21.375rem',
            data: {
              title: 'Error',
              text: err.error.message,
              buttonText: 'Okay',
            },
          });
        }
      );
    }
    if (
      this.data.buttonText == 'Inactive' ||
      this.data.buttonText == 'Active' ||
      this.data.buttonText == 'Removed'
    ) {
      this.dialogRef.close('updated');
    } else {
      this.dialogRef.close('updated');
    }
  }
}
