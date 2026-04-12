import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { WorkshopHistoryCreateDto } from '../../../profiles/components/truck/models/workshop-history.model';
import { ImageGalleryService } from '../../../../shared/services/image-gallery/image-gallery.service';
import { ImageGalleryComponent } from '../../../../shared/modules/image-gallery/image-gallery.component';
import { NewWorkshopPopupComponent } from '../new-workshop-popup/new-workshop-popup.component';

@Component({
  selector: 'app-workshop-records',
  imports: [NgForOf, NgIf, DatePipe],
  providers: [provideNativeDateAdapter()],
  templateUrl: './workshop-records.component.html',
  styleUrl: './workshop-records.component.scss',
})
export class WorkshopRecordsComponent implements OnInit {
  private service = inject(TruckService);
  private dialog = inject(MatDialog);
  private imageGalleryService = inject(ImageGalleryService);
  public dialogData: any = inject(MAT_DIALOG_DATA, { optional: true });

  loading = false;
  records: any[] = [];
  private readonly editableWindowMs = 30 * 24 * 60 * 60 * 1000;

  constructor(public dialogRef: MatDialogRef<WorkshopRecordsComponent>) {}

  ngOnInit() {
    const vehicleId = this.dialogData?.vehicleId;
    if (!vehicleId) return;
    this.fetchWorkshopRecords(String(vehicleId));
  }

  private fetchWorkshopRecords(vehicleId: string) {
    this.loading = true;
    const body = { vehicleId: [vehicleId] };
    const meta = {
      page: 0,
      limit: 50,
      sort: [{ order: 'DESC', field: 'entryDate' }],
    };
    this.service.getWorkshopHistory(body, meta).subscribe({
      next: (res: any) => {
        this.records = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.records = [];
        this.loading = false;
      },
    });
  }

  initial(name?: string) {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  onClickViewDoc(doc: any) {
    const url = doc?.preSignedFileUrl || doc?.fileUrl;
    if (!url) return;
    // Decide file type
    const isPdf = typeof url === 'string' && url.toLowerCase().endsWith('.pdf');
    this.imageGalleryService.setCurrentImage(url);
    this.dialog.open(ImageGalleryComponent, {
      data: isPdf
        ? { images: url, fileType: 'pdf', fileName: `${doc?.documentType || 'Document'}.pdf` }
        : { images: url },
      minWidth: isPdf ? '70vw' : undefined,
      minHeight: isPdf ? '80vh' : undefined,
    });
  }

  canEditRecord(date?: string): boolean {
    if (!date) return false;
    const recordDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - recordDate.getTime();
    return diff <= this.editableWindowMs;
  }

  getEditTooltip(date?: string): string {
    return this.canEditRecord(date)
      ? 'Edit workshop record'
      : 'Editable up to 30 days after the visit';
  }

  onEditWorkshopRecord(record: WorkshopHistoryCreateDto) {
    if (!this.canEditRecord(record.entryDate)) return;
    const vehicleId = this.dialogData?.vehicleId;
    const dialogRef = this.dialog.open(NewWorkshopPopupComponent, {
      minWidth: '37.125rem',
      data: {
        record,
      },
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.dialogData?.onRecordChange?.();
        if (vehicleId) {
          this.fetchWorkshopRecords(String(vehicleId));
        }
      }
    });
  }

  onClosePopup() {
    this.dialogRef.close();
  }
}
