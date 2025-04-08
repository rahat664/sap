import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SuccessModalComponent } from '../../shared/modules/success-modal/success-modal.component';

@Component({
  selector: 'app-support',
  imports: [DatePipe],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent {
  newDate: Date = new Date();
  readonly dialog = inject(MatDialog);

  onFormSubmit() {
    this.dialog.open(SuccessModalComponent, {
      data: {
        title: 'Success',
        text: 'Your request has been submitted successfully.',
        buttonText: 'Okay',
      },
    })
  }
}
