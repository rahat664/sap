import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TripService } from '../../../pages/trip-list/services/trip.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../../../pages/manage-trip/components/confirm-delete/confirm-delete.component';

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
  @ViewChild('containerElement') containerElement!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  zoomLevel: number = 1; // Default zoom level
  maxZoom: number = 3; // Maximum zoom level
  minZoom: number = 1; // Minimum zoom level
  translateX: number = 0; // Horizontal translation
  translateY: number = 0; // Vertical translation
  returnUrl: any;
  tripPointId: any;
  eventTypeId: any;

  readonly dialog = inject(MatDialog);

  constructor(
    private router: Router,
    private trip: TripService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.resetNavigationInformation();
    this.getNavigationInformation();
  }

  private resetNavigationInformation() {
    this.expiryAvailable = false;
    this.notesAvailable = false;
    this.notes = '';
    this.expiryDate = '';
    this.documents = [];
    this.imageType = 'image';
    this.activatedDocument = null;
    this.activeDocumentIndex = -1;
    this.returnUrl = null;
    this.tripPointId = null;
    this.eventTypeId = null;
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
      this.documents = navigation.tripDocuments
        ? navigation.tripDocuments
        : navigation.documents;
      this.imageType = navigation.imageType;
      this.activatedDocument = navigation.activatedDocument;
      this.returnUrl = navigation.returnUrl;
      this.tripId = navigation.tripId;
      this.tripPointId = navigation.tripPointId;
      this.eventTypeId = navigation.eventTypeId;
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

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  @ViewChild('documentContainer') documentContainer: ElementRef;

  onClickLeftButton() {
    this.changeActiveDocument(-1);
  }

  onClickRightButton() {
    this.changeActiveDocument(1);
  }

  onZoom(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel += 0.1;
      this.adjustZoomBoundaries();
    }
  }

  // Zoom out
  tripId: string;
  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= 0.1;
      this.adjustZoomBoundaries();
    }
  }

  adjustZoomBoundaries() {
    const container = this.containerElement.nativeElement;
    const image = this.imageElement.nativeElement;

    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    // Calculate overflow distances
    const overflowX = (imageRect.width - containerRect.width) / 2;
    const overflowY = (imageRect.height - containerRect.height) / 2;

    // Clamp the translations to prevent overflow
    this.translateX = Math.max(
      -overflowX,
      Math.min(overflowX, this.translateX)
    );
    this.translateY = Math.max(
      -overflowY,
      Math.min(overflowY, this.translateY)
    );
  }

  onClickDelete() {
    // apply delete functionalities to activeDocument
    if (this.documents?.length > 0) {
      if (this.activatedDocument) {
        this.dialog
          .open(ConfirmDeleteComponent, {
            data: {
              title: 'Attention',
              text: 'Are you sure you want to delete this document?',
              buttonText: 'Delete',
            },
          })
          .afterClosed()
          .subscribe(res => {
            const tripPointId = this.tripPointId
              ? this.tripPointId
              : this.activatedDocument?.event?.tripPointId;
            const eventTypeId = this.eventTypeId
              ? this.eventTypeId
              : this.activatedDocument?.event?.eventTypeId;
            const documentId = this.activatedDocument?.id
              ? this.activatedDocument?.id
              : this.activatedDocument?.document.id;
            if (res === 'deleted') {
              this.trip
                .deleteTripDocument(tripPointId, eventTypeId, documentId)
                .subscribe(() => {
                  this.documents = this.documents.filter(
                    doc => doc !== this.activatedDocument
                  );
                  this.activatedDocument = this.documents[0];
                  this.activeDocumentIndex = 0;
                  this.scrollToActiveDocument();
                  if (this.documents.length === 0) {
                    this.router.navigate([this.returnUrl]);
                  }
                });
            }
          });
      }
    }
  }

  onClickDownload() {
    // apply download functionalities to activeDocument
    if (this.documents?.length > 0) {
      if (this.activatedDocument) {
        const link = document.createElement('a');
        link.href = this.activatedDocument.url
          ? this.activatedDocument.url
          : this.activatedDocument?.document?.url;
        link.download = `${this.imageType}`;
        document.body.appendChild(link);
        link.click();
      }
    }
  }

  onClickBack() {
    console.log('returnUrl', this.returnUrl);
    this.router.navigate([this.returnUrl]);
  }
}
