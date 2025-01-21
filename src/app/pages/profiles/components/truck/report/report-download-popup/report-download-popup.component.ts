import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-report-download-popup',
  imports: [],
  templateUrl: './report-download-popup.component.html',
  styleUrl: './report-download-popup.component.scss',
})
export class ReportDownloadPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<ReportDownloadPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeModal() {
    this.dialogRef.close();
  }

  downloadReport() {
    this.dialogRef.close('download');
  }
}
