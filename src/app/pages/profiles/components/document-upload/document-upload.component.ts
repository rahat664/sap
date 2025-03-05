import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TripService } from '../../../trip-list/services/trip.service';
import { ConfirmDeleteComponent } from '../../../manage-trip/components/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-document-upload',
  imports: [
    DatePipe,
    FallbackImagePipe,
    ImageErrorDirective,
    NgForOf,
    NgIf,
    NgClass,
  ],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss',
})
export class DocumentUploadComponent {
  expiryAvailable = false;
  notesAvailable = false;
  notes = '';
  expiryDate = '';
  documents: any[] = [];
  imageType = 'image';
  activatedDocument: any;
  activeDocumentIndex = -1;
  showRightArrow = false;
  showLeftArrow = false;
  @ViewChild('containerElement') containerElement!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  zoomLevel = 1; // Default zoom level
  maxZoom = 3; // Maximum zoom level
  minZoom = 1; // Minimum zoom level
  translateX = 0; // Horizontal translation
  translateY = 0; // Vertical translation
  returnUrl: any;
  documentBelongToId: string = '';
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

  private resetNavigationInformation() {}

  private getNavigationInformation() {
    const navigation = history.state;
    if (navigation) {
      this.documents = navigation.documents;
      this.activatedDocument = navigation.activatedDocument;
      this.returnUrl = navigation.returnUrl;
      this.imageType = navigation.imageType;
      this.updateActiveDocumentIndex();
      this.scrollToActiveDocument();
    }
    console.log(navigation);
  }

  private updateActiveDocumentIndex() {
    this.activeDocumentIndex = 1;
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

  @HostListener('document:keydown.Delete', ['$event'])
  onKeyDeleteHandler(event: KeyboardEvent) {
    this.onClickDelete();
  }

  // windows pop state event
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.onClickBack();
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
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '400px',
      data: {
        message: 'Are you sure you want to delete this document?',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documents = this.documents.filter(
          doc => doc !== this.activatedDocument
        );
        this.activatedDocument = this.documents[0];
        this.updateActiveDocumentIndex();
        this.scrollToActiveDocument();
      }
    });
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
    localStorage.setItem('isBack', 'true');
    this.router.navigate([this.returnUrl]);
  }

  downloadReport(images: any) {
    if (images) {
      const a = document.createElement('a');
      a.href = images;
      a.download = images;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}
