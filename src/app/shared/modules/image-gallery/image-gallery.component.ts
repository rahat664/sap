import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGalleryService } from '../../services/image-gallery/image-gallery.service';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
})
export class ImageGalleryComponent implements OnInit, OnDestroy {
  galleryImages: any;
  showGallery = false;
  private subs: Subscription;
  protected previewUrl: any;
  showNotPreviewAbleDialog: boolean;

  constructor(
    private imageGalleryService: ImageGalleryService,
    public dialogRef: MatDialogRef<ImageGalleryComponent>,
    public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.subs = this.imageGalleryService.currentImage$.subscribe(imageUrl => {
      if (imageUrl) {
        this.galleryImages = imageUrl;
        console.log(imageUrl);
        this.showGallery = true;
        if (this.checkImageOrDocument(this.galleryImages)) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.galleryImages
          );
        } else {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.galleryImages.preview
          );
        }
      } else {
        this.showGallery = false;
      }
    });
    if (this.data) {
      if (this.data.fileType === 'pdf') {
        this.showGallery = false;
        this.showNotPreviewAbleDialog = true;
      } else {
        this.showNotPreviewAbleDialog = false;
        this.showGallery = true;
      }
    }
    this.dialogRef.afterClosed().subscribe(() => {
      this.subs.unsubscribe();
      this.showGallery = false;
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  closeModal() {
    this.subs.unsubscribe();
    this.dialogRef.close();
  }

  checkImageOrDocument(galleryImages: any) {
    return typeof galleryImages === 'string';
  }

  downloadReport(images: any) {
    const a = document.createElement('a');
    a.href = images;
    a.download = images;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
