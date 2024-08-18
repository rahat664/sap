import { Component, Inject, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TripService } from '../../../trip-list/services/trip.service';
import { DatePipe } from '@angular/common';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';

@Component({
  selector: 'app-confirm-cancel',
  standalone: true,
  imports: [],
  templateUrl: './confirm-cancel.component.html',
  styleUrl: './confirm-cancel.component.scss',
})
export class ConfirmCancelComponent {
  readonly dialog = inject(MatDialog);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmCancelComponent>,
    private trip: TripService,
    private datePipe: DatePipe
  ) {}

  closeDialog() {
    this.dialogRef.close('');
  }

  ngOnInit() {}

  confirmUpdate() {
    const body = {};
    body['status'] = 'Cancelled';
    this.trip.updateTrip(body, this.data.trip.tripId).subscribe((res: any) => {
      this.dialogRef.close('updated');
      if (res.status == 'OK') {
        this.dialog
          .open(SuccessModalComponent, {
            width: '21.375rem',
            data: {
              title: 'Success',
              text: `Your trip has been cancelled`,
              buttonText: 'Okay',
            },
          })
          .afterClosed()
          .subscribe(() => {
            this.trip.reloadManageTripPage.next(true);
          });
      } else if (res.status == 'Bad Request') {
        this.dialog.open(ErrorModalComponent, {
          width: '21.375rem',
          data: {
            title: 'Error',
            text: res.message,
            buttonText: 'Okay',
          },
        });
      }
    });
  }
}
