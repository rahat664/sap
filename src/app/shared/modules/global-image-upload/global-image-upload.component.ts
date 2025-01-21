import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  OnChanges,
  AfterViewInit,
} from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCalendar, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatCard } from '@angular/material/card';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TimePickerComponent } from '../time-picker/time-picker.component';

@Component({
  selector: 'app-global-image-upload',
  imports: [
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatInput,
    NgIf,
    NgForOf,
    NgClass,
    FormsModule,
    MatButton,
    MatCalendar,
    MatCard,
    MatDatepickerToggle,
    MatMenu,
    MatSuffix,
    TimePickerComponent,
    MatMenuTrigger,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './global-image-upload.component.html',
  styleUrl: './global-image-upload.component.scss',
})
export class GlobalImageUploadComponent implements OnChanges, AfterViewInit {
  currentDate: Date = new Date();
  @ViewChild('containerElement') containerElement!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  zoomLevel = 1; // Default zoom level
  maxZoom = 3; // Maximum zoom level
  minZoom = 1; // Minimum zoom level
  translateX = 0; // Horizontal translation
  translateY = 0; // Vertical translation
  note = '';
  @Input() imageTypes: any[] = [];
  months: any[] = [
    { value: '1', viewValue: 'January' },
    { value: '2', viewValue: 'February' },
    { value: '3', viewValue: 'March' },
    { value: '4', viewValue: 'April' },
    { value: '5', viewValue: 'May' },
    { value: '6', viewValue: 'June' },
    { value: '7', viewValue: 'July' },
    { value: '8', viewValue: 'August' },
    { value: '9', viewValue: 'September' },
    { value: '10', viewValue: 'October' },
    { value: '11', viewValue: 'November' },
    { value: '12', viewValue: 'December' },
  ];
  @Input() expiryAvailable = false;
  @Input() notesAvailable = false;
  @Input() documents: any[] = [];
  @Input() activeDocumentIndex = -1;
  @Input() activatedDocument: any;
  @Output() closedDocument = new EventEmitter<any>();
  @Output() saveButtonClicked = new EventEmitter<boolean>();
  showLeftArrow: boolean;
  showRightArrow: boolean;
  activatedImageType: any;
  @Output() forwardedNote = new EventEmitter<string>();
  @Output() forwardedImageType = new EventEmitter<string>();
  @Output() forwardedDateType = new EventEmitter<string>();
  @Output() isBackButtonClick = new EventEmitter<boolean>();

  constructor(
    private datePipe: DatePipe,
    private cd: ChangeDetectorRef
  ) {}

  onChangeImageType($event: any) {
    this.activatedImageType = $event.value;
    this.forwardedImageType.emit($event.value);
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

  ngOnChanges() {
    if (this.imageTypes) {
      if (this.imageTypes.length === 1) {
        this.activatedImageType = this.imageTypes[0].viewValue;
      }
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

  zoomInAvailable = true;
  zoomOutAvailable = false;
  @Input() isLoading = false;

  returnToInputDate: Date;
  selectedDate: Date = new Date();

  onClickClose() {
    // remove the activated document from the documents array
    const index = this.documents.indexOf(this.activatedDocument);
    this.documents.splice(index, 1);
    this.closedDocument.emit(this.documents[index]);
  }

  onClickSave() {
    this.forwardedNote.emit(this.note);
    this.saveButtonClicked.emit(true);
  }

  onSelectTimeAndDate() {
    // convert time to 24-hour format
    const time = this.time.split(' ')[0];
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);
    const amOrPm = this.time.split(' ')[1];
    const timeIn24HourFormat = amOrPm === 'PM' ? hour + 12 : hour;
    const selectedDate = this.selectedDate;
    selectedDate.setHours(timeIn24HourFormat, hour);
    selectedDate.setMinutes(minute);
    this.forwardedDateType.emit(
      this.datePipe.transform(selectedDate, 'yyyy-MM-ddTHH:mm:ss')
    );
  }

  onSelect($event: any) {
    this.selectedDate = $event;
    this.returnToInputDate = $event;
  }
  private time: any;
  @Input() tripId: string;
  onTimeChange($event: any) {
    this.time = $event;
  }

  getSelectedDate() {
    return this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd h:mm a');
  }

  onCLickBack() {
    this.isBackButtonClick.emit(true);
  }
}
