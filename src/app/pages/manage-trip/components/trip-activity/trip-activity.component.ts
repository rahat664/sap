import { Component, Input } from '@angular/core';
import { TripService } from '../../../trip-list/services/trip.service';
import { CommonModule } from '@angular/common';
import { EventData } from '../../model/trip-events.model';

@Component({
  selector: 'app-trip-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-activity.component.html',
  styleUrl: './trip-activity.component.scss',
})
export class TripActivityComponent {
  @Input() tripId: string;
  loadingEvents: EventData[] = [];
  unloadEvents: EventData[] = [];
  selectedEventNameLoading: string;
  selectedEventNameUnloading: string;
  selectedEvent: EventData;
  selectedUnloadingEvent: EventData;
  imageToShow: any[] = [];
  unloadImageToShow: any[] = [];
  index: number = 0;
  unloadingIndex: number = 0;
  loadingEventsLoaded: boolean = false;
  unloadingEventsLoaded: boolean = false;

  constructor(private trip: TripService) {}

  ngOnInit() {
    this.index = 0;
    this.unloadingIndex = 0;
    this.imageToShow = [];
    this.unloadImageToShow = [];
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
      this.selectedEventNameLoading = this.loadingEvents[0].eventName;
      this.selectedEvent = this.loadingEvents[0];
      this.addPaginationWhenImageAreMoreThanThree(this.selectedEvent);
    });
  }

  private getUnloadEvents(tripId: string) {
    this.trip.getAllTripEvent(tripId, 'Unloading').subscribe((res: any) => {
      this.unloadEvents = res.data;
      this.unloadingEventsLoaded = true;
      this.selectedEventNameUnloading = this.unloadEvents[0].eventName;
      this.selectedUnloadingEvent = this.unloadEvents[0];
      this.addUnloadingPaginationWhenImageAreMoreThanThree(
        this.selectedUnloadingEvent
      );
    });
  }

  changeTripLoadingEvent(event: EventData) {
    this.selectedEvent = event;
    this.selectedEventNameLoading = event.eventName;
    this.addPaginationWhenImageAreMoreThanThree(event);
  }

  changeTripUnloadingEvent(event: EventData) {
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
    // initially load four of the images and then load the rest of the images
    if (selectedEvent.urls) {
      if (selectedEvent.urls.length > 3) {
        const totalImages = selectedEvent.urls.length;
        const dividedImages = Math.ceil(totalImages / 3);
        for (let i = 0; i < dividedImages; i++) {
          this.imageToShow.push(selectedEvent.urls.slice(i * 3, i * 3 + 3));
          console.log(this.imageToShow);
        }
      } else {
        this.imageToShow = [];
        this.imageToShow.push(selectedEvent.urls);
      }
    }
    console.log(this.imageToShow);
  }

  private addUnloadingPaginationWhenImageAreMoreThanThree(
    selectedEvent: EventData
  ) {
    this.unloadImageToShow = [];
    // initially load four of the images and then load the rest of the images
    if (selectedEvent.urls) {
      if (selectedEvent.urls.length > 3) {
        const totalImages = selectedEvent.urls.length;
        const dividedImages = Math.ceil(totalImages / 3);
        for (let i = 0; i < dividedImages; i++) {
          this.unloadImageToShow.push(
            selectedEvent.urls.slice(i * 3, i * 3 + 3)
          );
        }
      } else {
        this.unloadImageToShow = [];
        this.unloadImageToShow.push(selectedEvent.urls);
      }
      console.log(this.unloadImageToShow);
    }
  }
}
