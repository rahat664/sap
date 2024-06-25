import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageGalleryService {
  private imageSubject = new BehaviorSubject<string>(null);
  currentImage$ = this.imageSubject.asObservable();
  constructor() { }

  setCurrentImage(image: string) {
    this.imageSubject.next(image);
  }
}
