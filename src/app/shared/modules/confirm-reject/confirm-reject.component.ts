import { Component, Inject, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-confirm-reject',
  imports: [FormsModule, NgClass, NgIf],
  templateUrl: './confirm-reject.component.html',
  styleUrl: './confirm-reject.component.scss',
})
export class ConfirmRejectComponent {
  readonly dialog = inject(MatDialog);
  reason = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmRejectComponent>
  ) {}

  closeDialog() {
    this.dialogRef.close('');
  }

  confirmUpdate() {
    this.dialogRef.close({
      reason: this.reason,
      status: 'rejected',
    });
  }
}
