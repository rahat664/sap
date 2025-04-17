import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  AfterViewInit,
  inject,
} from '@angular/core';
import { TripService } from '../../../trip-list/services/trip.service';
import { CommonModule } from '@angular/common';
import { EventData } from '../../model/trip-events.model';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { ImageGalleryComponent } from '../../../../shared/modules/image-gallery/image-gallery.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageGalleryService } from '../../../../shared/services/image-gallery/image-gallery.service';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';

@Component({
  selector: 'app-trip-activity',
  imports: [
    CommonModule,
    GetElementHeightDirective,
    FallbackImagePipe,
    ImageErrorDirective,
  ],
  templateUrl: './trip-activity.component.html',
  styleUrl: './trip-activity.component.scss',
})
export class TripActivityComponent implements OnInit, OnChanges, AfterViewInit {
  readonly dialog = inject(MatDialog);
  @Input() tripId: string;
  loadingEvents: EventData[] = [];
  unloadEvents: EventData[] = [];
  selectedEventNameLoading: string;
  selectedEventNameUnloading: string;
  selectedEvent: EventData;
  selectedUnloadingEvent: EventData;
  imageToShow: any[] = [];
  unloadImageToShow: any[] = [];
  index = 0;
  unloadingIndex = 0;
  loadingEventsLoaded = false;
  unloadingEventsLoaded = false;
  loadingHeight = '0px';
  unloadingHeight = '0px';

  constructor(
    private trip: TripService,
    private cd: ChangeDetectorRef,
    private imageGalleryService: ImageGalleryService
  ) {}

  ngOnInit() {
    this.index = 0;
    this.unloadingIndex = 0;
  }

  ngOnChanges(SimpleChanges: any) {
    if (SimpleChanges.tripId.currentValue) {
      this.loadingEventsLoaded = false;
      this.unloadingEventsLoaded = false;
      this.index = 0;
      this.unloadingIndex = 0;
      this.imageToShow = [];
      this.unloadImageToShow = [];
      this.getLoadingEvents(SimpleChanges.tripId.currentValue);
      this.getUnloadEvents(SimpleChanges.tripId.currentValue);
    }
  }

  private getLoadingEvents(tripId: string) {
    this.trip.getAllTripEvent(tripId, 'Loading').subscribe((res: any) => {
      this.loadingEventsLoaded = true;
      this.loadingEvents = res.data;
      this.loadingEvents.forEach((e: any) => {
        if (e.eventTypeId === 14) {
          if (e.subTripPointEvents.length > 0) {
            e.subTripPointEvents.forEach((eve: any) => {
              if (e.tripDocuments) {
                eve.tripDocuments['subtitle'] = eve.eventName;
                e.tripDocuments.push(...eve.tripDocuments);
              } else {
                e.tripDocuments = eve.tripDocuments;
              }
              if (e.notes) {
                e.notes.push(...eve.notes);
              } else {
                e.notes = eve.notes;
              }
            })
          }
        }
      })
      if (this.loadingEvents.length > 0) {
        this.changeTripLoadingEvent(this.loadingEvents[0]);
      } else {
        this.selectedEventNameLoading = '';
        this.imageToShow = [];
      }
    });
  }

  private getUnloadEvents(tripId: string) {
    this.trip.getAllTripEvent(tripId, 'Unloading').subscribe((res: any) => {
      this.unloadEvents = res.data;
      this.unloadingEventsLoaded = true;
      if (this.unloadEvents.length > 0) {
        this.changeTripUnloadingEvent(this.unloadEvents[0]);
      } else {
        this.selectedEventNameUnloading = '';
        this.unloadImageToShow = [];
      }
    });
  }

  changeTripLoadingEvent(event: EventData) {
    this.imageToShow = [];
    this.unloadingIndex = 0;
    this.selectedEvent = event;
    this.selectedEventNameLoading = event.eventName;
    this.addPaginationWhenImageAreMoreThanThree(event);
  }

  changeTripUnloadingEvent(event: EventData) {
    this.unloadImageToShow = [];
    this.index = 0;
    this.selectedUnloadingEvent = event;
    this.selectedEventNameUnloading = event.eventName;
    this.addUnloadingPaginationWhenImageAreMoreThanThree(event);
  }

  onClickLeftButton() {
    if (this.index > 0) {
      this.index--;
    }
  }

  onClickRightButton() {
    if (this.index < this.imageToShow.length - 1) {
      this.index++;
    }
  }

  onClickLeftButtonUnloading() {
    if (this.unloadingIndex > 0) {
      this.unloadingIndex--;
    }
  }

  onClickRightButtonUnloading() {
    if (this.unloadingIndex < this.unloadImageToShow.length - 1) {
      this.unloadingIndex++;
    }
  }

  private addPaginationWhenImageAreMoreThanThree(selectedEvent: EventData) {
    this.imageToShow = [];
    if (selectedEvent.tripDocuments) {
      if (selectedEvent.tripDocuments.length > 3) {
        const totalImages = selectedEvent.tripDocuments.length;
        const dividedImages = Math.ceil(totalImages / 3);
        for (let i = 0; i < dividedImages; i++) {
          this.imageToShow.push(
            selectedEvent.tripDocuments.slice(i * 3, i * 3 + 3)
          );
        }
      } else {
        this.imageToShow = [];
        this.imageToShow.push(selectedEvent.tripDocuments);
      }
    } else {
      this.imageToShow = [];
    }
  }

  private addUnloadingPaginationWhenImageAreMoreThanThree(
    selectedEvent: EventData
  ) {
    this.unloadImageToShow = [];
    // initially load four of the images and then load the rest of the images
    if (selectedEvent.tripDocuments) {
      if (selectedEvent.tripDocuments.length > 3) {
        const totalImages = selectedEvent.tripDocuments.length;
        const dividedImages = Math.ceil(totalImages / 3);
        for (let i = 0; i < dividedImages; i++) {
          this.unloadImageToShow.push(
            selectedEvent.tripDocuments.slice(i * 3, i * 3 + 3)
          );
        }
      } else {
        this.unloadImageToShow = [];
        this.unloadImageToShow.push(selectedEvent.tripDocuments);
      }
    } else {
      this.unloadImageToShow = [];
    }
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  checkThatFileIsImageOrPdf(file: any) {
    // check if the file is an image or a pdf file
    if (file?.includes('pdf')) {
      return 'pdf';
    } else {
      return 'image';
    }
  }

  onClickImage(file: any, type: string, docType: string) {
    // if the file is a PDF file, then convert it to blob of a PDF document file is just
    if (type === 'pdf') {
      // this is a blob of the file
      this.imageGalleryService.setCurrentImage(file);
      this.dialog.open(ImageGalleryComponent, {
        data: {
          images: file,
          fileType: 'pdf',
          fileName: `${docType === 'loading' ? this.selectedEventNameLoading : this.selectedEventNameUnloading}.pdf`,
        },
      });
    }
  }
}
