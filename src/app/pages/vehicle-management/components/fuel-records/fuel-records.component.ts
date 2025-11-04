import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { ImageGalleryService } from '../../../../shared/services/image-gallery/image-gallery.service';
import { ImageGalleryComponent } from '../../../../shared/modules/image-gallery/image-gallery.component';

@Component({
  selector: 'app-fuel-records',
  imports: [NgForOf, NgIf, DatePipe],
  templateUrl: './fuel-records.component.html',
  styleUrl: './fuel-records.component.scss'
})
export class FuelRecordsComponent implements OnInit {
  private service = inject(TruckService);
  private dialog = inject(MatDialog);
  private imageGalleryService = inject(ImageGalleryService);
  public dialogData: any = inject(MAT_DIALOG_DATA, { optional: true });

  loading = false;
  records: any[] = [];

  constructor(public dialogRef: MatDialogRef<FuelRecordsComponent>) {}

  ngOnInit(): void {
    const vehicleId = this.dialogData?.vehicleId;
    if (!vehicleId) return;
    this.fetchFuelRecords(String(vehicleId));
  }

  private fetchFuelRecords(vehicleId: string) {
    this.loading = true;
    const body = { vehicleId: [vehicleId] };
    const meta = {
      page: 0,
      size: 50,
      sort: [{ field: 'refuelDateTime', direction: 'DESC' }],
    };
    this.service.getFuelHistory(body, meta).subscribe({
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

  onClickViewDoc(doc: any) {
    const url = doc?.preSignedFileUrl || doc?.fileUrl;
    if (!url) return;
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

  onClosePopup() {
    this.dialogRef.close();
  }
}
