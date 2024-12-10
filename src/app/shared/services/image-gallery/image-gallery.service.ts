import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageGalleryService {
  private imageSubject = new BehaviorSubject<any>(null);
  currentImage$ = this.imageSubject.asObservable();

  constructor() {}

  setCurrentImage(image: any) {
    this.imageSubject.next(image);
  }
}
