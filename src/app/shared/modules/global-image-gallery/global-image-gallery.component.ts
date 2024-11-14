import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { navigation } from '@ngrx/router-store/data-persistence';

@Component({
  selector: 'app-global-image-gallery',
  standalone: true,
  imports: [DatePipe, NgIf, NgForOf, NgClass],
  templateUrl: './global-image-gallery.component.html',
  styleUrl: './global-image-gallery.component.scss',
})
export class GlobalImageGalleryComponent implements OnInit, AfterViewInit {
  expiryAvailable: boolean = false;
  notesAvailable: boolean = false;
  notes: string = '';
  expiryDate: string = '';
  documents: any[] = [];
  imageType: string = 'image';
  activatedDocument: any;
  activeDocumentIndex: number = -1;
  showRightArrow: boolean = false;
  showLeftArrow: boolean = false;

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
      this.notes = navigation.notesAvailable ? navigation.notes : null;
      this.expiryDate = navigation.expiryAvailable
        ? navigation.expiryDate
        : null;
      this.documents = navigation.tripDocuments;
      this.imageType = navigation.imageType;
      this.activatedDocument = navigation.activatedDocument;
      this.updateActiveDocumentIndex();
      this.scrollToActiveDocument();
    }
  }

  private updateActiveDocumentIndex() {
    this.activeDocumentIndex = this.documents.findIndex(
      doc => doc === this.activatedDocument
    );
  }

  private scrollToActiveDocument() {
    const documentElements =
      this.documentContainer?.nativeElement.querySelectorAll('.document-item');
    const clickedElement = documentElements?.[this.activeDocumentIndex];
    if (clickedElement) {
      clickedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }

  onClickDocument(doc: any, index: number) {
    this.activatedDocument = doc;
    this.activeDocumentIndex = index;
    this.scrollToActiveDocument();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  onKeyRightHandler(event: KeyboardEvent) {
    this.changeActiveDocument(1);
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  onKeyLeftHandler(event: KeyboardEvent) {
    this.changeActiveDocument(-1);
  }

  private changeActiveDocument(direction: number) {
    if (this.documents.length > 1) {
      const currentIndex = this.documents.indexOf(this.activatedDocument);
      const newIndex =
        (currentIndex + direction + this.documents.length) %
        this.documents.length;
      this.activatedDocument = this.documents[newIndex];
      this.activeDocumentIndex = newIndex;
      this.scrollToActiveDocument();
    }
  }

  onMouseEnter() {
    // Show the arrows when mouse enters the container
    this.updateArrows();
  }
  private updateArrows() {
    // Show or hide arrows based on the initial mouse position
    // This could be useful if we want to show arrows when the mouse enters the container
    // but before any mouse movement happens.
    this.showLeftArrow = false; // No arrow shown by default
    this.showRightArrow = false; // No arrow shown by default
  }

  onMouseLeave() {
    // Hide the arrows when mouse leaves the container
    this.showLeftArrow = false;
    this.showRightArrow = false;
  }

  onMouseMove(event: MouseEvent) {
   // only target parent element not child
    if (event.target !== event.currentTarget) {
      return;
    }
    const containerWidth = event.target['offsetWidth']; // Get container width
    const cursorX = event.offsetX; // Get X position of the cursor within the container

    // Show the left arrow when cursor is within the left 10% of the container
    this.showLeftArrow = cursorX < containerWidth * 0.5;

    // Show the right arrow when cursor is within the right 10% of the container
    this.showRightArrow = cursorX > containerWidth * 0.5;
  }

  ngAfterViewInit(): void {}

  @ViewChild('documentContainer') documentContainer: ElementRef;

  onClickLeftButton() {
    this.changeActiveDocument(-1);
  }
  onClickRightButton() {
    this.changeActiveDocument(1);
  }
}
