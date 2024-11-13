import { Component, HostListener, ViewChild } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-global-image-gallery',
  standalone: true,
  imports: [DatePipe, NgIf, NgForOf],
  templateUrl: './global-image-gallery.component.html',
  styleUrl: './global-image-gallery.component.scss',
})
export class GlobalImageGalleryComponent {
  expiryAvailable: boolean = false;
  notesAvailable: boolean = false;
  notes: string = '';
  expiryDate: string = '';
  documents: any[] = [];
  imageType: string = 'image';
  activatedDocument: any;
  ngOnInit() {
    this.resetNavigationInformation();
    this.getNavigationInformation();
  }

  private resetNavigationInformation() {
    this.expiryAvailable = false;
    this.notesAvailable = false;
    this.notes = '';
    this.expiryDate = '';
  }

  private getNavigationInformation() {
    const navigation = history.state;
    if (navigation) {
      this.expiryAvailable = navigation.expiryAvailable;
      this.notesAvailable = navigation.notesAvailable;
      if (this.notesAvailable) {
        this.notes = navigation.notes;
      }
      if (this.expiryAvailable) {
        this.expiryDate = navigation.expiryDate;
      }
      this.documents = navigation.tripDocuments;
      this.imageType = navigation.imageType;
      this.activatedDocument = navigation.activatedDocument;
    }
  }

  onClickDocument(doc: any) {
    this.activatedDocument = doc;
  }
  // on Click right arrow
  @HostListener('document:keydown.ArrowRight', ['$event']) onKeyRightHandler(event: KeyboardEvent) {
    if (this.documents.length > 1) {
      const index = this.documents.indexOf(this.activatedDocument);
      if (index < this.documents.length - 1) {
        this.activatedDocument = this.documents[index + 1];
      } else {
        this.activatedDocument = this.documents[0];
      }
    }
  }

  // on Click left arrow
  @HostListener('document:keydown.ArrowLeft', ['$event']) onKeyLeftHandler(event: KeyboardEvent) {
    if (this.documents.length > 1) {
      const index = this.documents.indexOf(this.activatedDocument);
      if (index > 0) {
        this.activatedDocument = this.documents[index - 1];
      } else {
        this.activatedDocument = this.documents[this.documents.length - 1];
      }
    }
  }
}
