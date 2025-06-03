import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-bid-accept-popup',
  imports: [NgForOf],
  templateUrl: './bid-accept-popup.component.html',
  styleUrl: './bid-accept-popup.component.scss',
})
export class BidAcceptPopupComponent {
  confirmBidFields: any[] = [
    { label: 'Transporter', value: this.data?.bid?.transporterName},
    {label: 'Mobile', value: this.data?.bid?.mobile},
    {label: 'Truck Type', value: this.data?.truckType},
    {label: 'No. of truck', value: this.data?.bid?.submittedNumberOfTruck},
    {label: 'Bid per truck', value: this.data?.bid?.amount + '৳'},
    {label: 'Total Bid Amount', value: this.data?.bid?.amount + '৳'},

  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BidAcceptPopupComponent>
  ) {}

  dismissModal() {
    this.dialogRef.close(true);
  }

  closeDialog() {
    this.dialogRef.close(false)
  }
}
