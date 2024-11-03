import { Component, Inject, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-approve',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './confirm-approve.component.html',
  styleUrl: './confirm-approve.component.scss',
})
export class ConfirmApproveComponent {
  readonly dialog = inject(MatDialog);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmApproveComponent>
  ) {}

  closeDialog() {
    this.dialogRef.close('');
  }

  confirmUpdate() {
    this.dialogRef.close('updated');
  }
}
