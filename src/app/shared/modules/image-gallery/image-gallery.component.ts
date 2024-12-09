import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGalleryService } from '../../services/image-gallery/image-gallery.service';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
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

  constructor(
    private imageGalleryService: ImageGalleryService,
    public dialogRef: MatDialogRef<ImageGalleryComponent>,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.subs = this.imageGalleryService.currentImage$.subscribe(imageUrl => {
      if (imageUrl) {
        this.galleryImages = imageUrl;
        this.showGallery = true;
        if (this.checkImageOrDocument(this.galleryImages)) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.galleryImages
          );
        } else {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.galleryImages.preview
              ? this.galleryImages.preview
              : this.galleryImages.preSignedFileUrl
          );
        }
      } else {
        this.showGallery = false;
      }
    });
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
}
