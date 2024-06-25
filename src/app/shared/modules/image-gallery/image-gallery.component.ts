import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryModule, NgxGalleryOptions} from "@kolkov/ngx-gallery";
import {ImageGalleryService} from "../../services/image-gallery/image-gallery.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    CommonModule,
    NgxGalleryModule
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss'
})
export class ImageGalleryComponent implements OnInit, OnDestroy {
  galleryOptions: NgxGalleryOptions[];
  galleryImages: string;
  showGallery: boolean = false;
  private subs: Subscription;
  constructor(private imageGalleryService: ImageGalleryService) { }

  ngOnInit(): void {
    this.galleryOptions = [
      {
        width: '75vw',// 600px in rem
        height: '75vh', // 400px in rem
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
        imageArrows: false,
        imageSwipe: true,
        thumbnails: false,
        imagePercent: 100,
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '37.5rem', // 600px in rem
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];
     this.subs = this.imageGalleryService.currentImage$.subscribe(imageUrl => {
       if (imageUrl) {
         this.galleryImages = imageUrl
         this.showGallery = true;
       } else {
         this.showGallery = false;
       }
     });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
