import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGalleryService } from '../../services/image-gallery/image-gallery.service';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
})
export class ImageGalleryComponent implements OnInit, OnDestroy {
  galleryImages: string;
  showGallery = false;
  private subs: Subscription;

  constructor(
    private imageGalleryService: ImageGalleryService,
    public dialogRef: MatDialogRef<ImageGalleryComponent>
  ) {}

  ngOnInit(): void {
    this.subs = this.imageGalleryService.currentImage$.subscribe(imageUrl => {
      if (imageUrl) {
        this.galleryImages = imageUrl;
        this.showGallery = true;
      } else {
        this.showGallery = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  closeModal() {
    this.subs.unsubscribe();
    this.dialogRef.close();
  }
}
