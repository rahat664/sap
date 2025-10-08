import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-workshop-records',
  imports: [
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './workshop-records.component.html',
  styleUrl: './workshop-records.component.scss',
})
export class WorkshopRecordsComponent {
  constructor(
    public dialogRef: MatDialogRef<WorkshopRecordsComponent>) {
  }

  onClosePopup() {
    this.dialogRef.close();
  }
}
