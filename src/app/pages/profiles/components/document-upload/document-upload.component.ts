import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TripService } from '../../../trip-list/services/trip.service';
import { ConfirmDeleteComponent } from '../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { DomSanitizer } from '@angular/platform-browser';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';

@Component({
  selector: 'app-document-upload',
  imports: [
    DatePipe,
    FallbackImagePipe,
    ImageErrorDirective,
    NgForOf,
    NgIf,
    NgClass,
    MatDatepicker,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepickerModule,
    FormsModule,
    MatFormFieldModule
  ],
  providers: [
    provideNativeDateAdapter(),
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
  activeDocumentIndex = 0;
  showRightArrow = false;
  showLeftArrow = false;
  @ViewChild('containerElement') containerElement!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @Output() returnImagesToParent: EventEmitter<any> = new EventEmitter();
  zoomLevel = 1; // Default zoom level
  maxZoom = 3; // Maximum zoom level
  minZoom = 1; // Minimum zoom level
  translateX = 0; // Horizontal translation
  translateY = 0; // Vertical translation
  returnUrl: any;
  documentBelongToId: string = '';
  readonly dialog = inject(MatDialog);
  documentFiles: any[] = [];

  constructor(
    private router: Router,
    private trip: TripService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private toaster: HandleToastrService
  ) {}

  ngOnInit() {
    this.resetNavigationInformation();
    this.getNavigationInformation();
  }

  private resetNavigationInformation() {}

  private getNavigationInformation() {
    const navigation = history.state;
    if (navigation) {
      this.previewDocuments(navigation.documents);
      this.returnUrl = navigation.returnUrl;
      this.imageType = navigation.imageType;
      this.expiryAvailable = navigation.expiryAvailable;
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
  uploadTime: Date = new Date();
  isLoading: boolean;

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
        title: 'Attention',
        text: 'Are you sure you want to close this document?',
        buttonText: 'Yes',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documents = this.documents.filter(
          doc => doc !== this.activatedDocument
        );
        if (this.documents.length === 0) {
          this.router.navigate([this.returnUrl]);
          return;
        }
        this.activatedDocument = this.documents[0];
        this.updateActiveDocumentIndex();
        this.scrollToActiveDocument();
      }
    });
  }


  onClickBack() {
    localStorage.setItem('isBack', 'true');
    this.router.navigate([this.returnUrl]);
  }


  private previewDocuments(addedDocuments) {
    if (addedDocuments) {
      this.documentFiles = []; // Reset or initialize documentFiles
      this.documents = []; // Reset document previews

      for (let i = 0; i < addedDocuments.length; i++) {
        const file = addedDocuments[i];
        const reader = new FileReader();

        reader.onload = () => {
          const previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            reader.result.toString()
          );

          this.documents.push(previewUrl);
          this.documentFiles.push({
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
            },
            preview: reader.result, // Store actual preview
          });



          // Set activatedDocument after all files are processed
          if (i === addedDocuments.length - 1) {
            this.activatedDocument = this.documents[0];
            this.activeDocumentIndex = 0;
          }
        };

        reader.readAsDataURL(file);
      }
    }
  }

  onClickSave() {
    // Ensure data is saved after all files are processed
    if (this.expiryAvailable && !this.expiryDate) {
      this.toaster.showError(
        'Please select an expiry date for the document.'
      );
      return;
    } else {
      setTimeout(() => {
        // only store the documentFiles file object in sessionStorage
        const doc = this.documentFiles.map(file => {
          return {
            name: file.file.name,
            type: file.file.type,
            size: file.file.size,
            lastModified: file.file.lastModified,
            base64: file.preview,
          };
        });
        // check there is any document on the sessionStorage if found then store a previous and current document in the sessionStorage

        const isAlreadyStored = JSON.parse(
          sessionStorage.getItem(`${this.imageType}`)
        );
        if (isAlreadyStored) {
          const previousDoc = JSON.parse(
            sessionStorage.getItem(`${this.imageType}`)
          );
          previousDoc.forEach(document => {
            doc.push(document);
          });
          sessionStorage.setItem(`${this.imageType}`, JSON.stringify(doc));
        } else {
          sessionStorage.setItem(`${this.imageType}`, JSON.stringify(doc));
        }
        this.router.navigate([this.returnUrl]);
      }, 500);
    }
    // Delay to allow file reading to complete
  }

  onDateChange($event: Event) {
    const date = $event.target['value'];
    this.expiryDate = this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss');
    sessionStorage.setItem(`${this.imageType.toLocaleLowerCase().replace(/\s/g,'')}expiry`, this.expiryDate);
  }
}
