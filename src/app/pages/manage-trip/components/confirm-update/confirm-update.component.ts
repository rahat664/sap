import { Component, inject, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { DatePipe, NgForOf } from '@angular/common';
import { TripService } from '../../../trip-list/services/trip.service';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';

class DialogData {}

@Component({
  selector: 'app-confirm-update',
  standalone: true,
  imports: [NgForOf],
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
    this.dialogRef.close('');
  }

  ngOnInit() {}

  confirmUpdate() {
    if (this.data.buttonText != 'Update') {
      const body = {};
      if (this.data.trip.status == 'Booked') {
        body['tripStartedAt'] = this.datePipe.transform(
          new Date(),
          'yyyy-MM-dd hh:mm:ss'
        );
      } else {
        body['status'] = 'Completed';
      }
      this.trip.updateTrip(body, this.data.trip.tripId).subscribe(
        (res: any) => {
          console.log(res);
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
                localStorage.setItem('updatedTripStatus', res.data.status);
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
    } else {
      this.dialogRef.close('updated');
    }
  }
}
