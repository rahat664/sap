import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WorkshopRecordsComponent } from '../workshop-records/workshop-records.component';

@Component({
  selector: 'app-fuel-records',
  imports: [],
  templateUrl: './fuel-records.component.html',
  styleUrl: './fuel-records.component.scss'
})
export class FuelRecordsComponent {
  constructor(
    public dialogRef: MatDialogRef<WorkshopRecordsComponent>) {
  }

  onClosePopup() {
    this.dialogRef.close();
  }
}
