import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-receivee-component',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './confirm-receivee-component.component.html',
  styleUrl: './confirm-receivee-component.component.scss',
})
export class ConfirmReceiveeComponentComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmReceiveeComponentComponent>
  ) {}
  closeDialog() {
    this.dialogRef.close(false)
  }

  confirmReceive() {
    this.dialogRef.close(true)
  }

  RejectReceive() {
    this.dialogRef.close(true)
  }
}
