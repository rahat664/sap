import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-successful-modal',
  imports: [],
  templateUrl: './payment-successful-modal.component.html',
  styleUrl: './payment-successful-modal.component.scss'
})
export class PaymentSuccessfulModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PaymentSuccessfulModalComponent>
  ) {}

  dismissModal() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
