import { Component, Inject, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TripService } from '../../../trip-list/services/trip.service';
import {DatePipe, NgClass, NgIf} from '@angular/common';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';
import {FormsModule} from "@angular/forms";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";

@Component({
  selector: 'app-confirm-cancel',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, MatCheckbox],
  templateUrl: './confirm-cancel.component.html',
  styleUrl: './confirm-cancel.component.scss',
})
export class ConfirmCancelComponent {
  readonly dialog = inject(MatDialog);
  reason: string | undefined;
   reasonTextArea: boolean;

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
    body['tripCancellationReason'] = this.reason;
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

  onChangeReason($event: MatCheckboxChange) {
    this.reason = $event?.source?.value
    if (this.reason == 'Others') {
      this.reason = '';
      this.reasonTextArea = true;
    } else {
      this.reasonTextArea = false;
    }
  }
}
