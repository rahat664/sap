import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TripService } from '../../../trip-list/services/trip.service';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';

@Component({
  selector: 'app-confirm-delete',
  imports: [],
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.scss',
})
export class ConfirmDeleteComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    private trip: TripService,
    private toaster: HandleToastrService
  ) {}

  closeDialog() {
    this.dialogRef.close('');
  }

  ngOnInit() {}

  confirmDelete() {
    this.dialogRef.close('deleted');
  }
}
