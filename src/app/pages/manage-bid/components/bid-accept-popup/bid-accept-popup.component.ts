import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgClass, NgForOf } from '@angular/common';

@Component({
  selector: 'app-bid-accept-popup',
  imports: [NgForOf, NgClass],
  templateUrl: './bid-accept-popup.component.html',
  styleUrl: './bid-accept-popup.component.scss',
})
export class BidAcceptPopupComponent {
  confirmBidFields: any[] = [
    {
      label: 'Transporter',
      value: this.data?.bid?.transporterName,
      isBold: false,
    },
    {
      label: 'Mobile',
      value: this.data?.bid?.transporterPhoneNumber,
      isBold: false,
    },
    { label: 'Truck Type', value: this.data?.truckType, isBold: false },
    {
      label: 'No. of truck',
      value: this.data?.bid?.submittedNumberOfTruck,
      isBold: true,
    },
    { label: 'Bid per truck', value: this.data?.bid?.amount + '৳', isBold: true },
    {
      label: 'Total Bid Amount',
      value:
        this.data?.bid?.amount * this.data?.bid?.submittedNumberOfTruck + '৳',
      isBold: true,
    },
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BidAcceptPopupComponent>
  ) {}

  dismissModal() {
    this.dialogRef.close(true);
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
