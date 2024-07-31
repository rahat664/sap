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

  constructor(private trip: TripService) {}

  ngOnChanges(SimpleChanges: any) {
    if (SimpleChanges.tripId.currentValue) {
      this.getLoadingEvents(SimpleChanges.tripId.currentValue);
      this.getUnloadEvents(SimpleChanges.tripId.currentValue);
    }
  }

  private getLoadingEvents(tripId: string) {
    this.trip.getAllTripEvent(tripId, 'Loading').subscribe((res: any) => {
      this.loadingEvents = res.data;
      this.selectedEventNameLoading = this.loadingEvents[0].eventName;
      this.selectedEvent = this.loadingEvents[0];
      this.addPaginationWhenImageAreMoreThanFour(this.selectedEvent);
    });
  }

  private getUnloadEvents(tripId: string) {
    this.trip.getAllTripEvent(tripId, 'Unloading').subscribe((res: any) => {
      this.unloadEvents = res.data;
      this.selectedEventNameUnloading = this.unloadEvents[0].eventName;
      this.selectedEvent = this.unloadEvents[0];
    });
  }

  changeTripLoadingEvent(event: EventData) {
    this.selectedEvent = event;
    this.selectedEventNameLoading = event.eventName;
  }

  changeTripUnloadingEvent(event: EventData) {
    this.selectedUnloadingEvent = event;
    this.selectedEventNameUnloading = event.eventName;
  }

  private addPaginationWhenImageAreMoreThanFour(selectedEvent: EventData) {
    if (selectedEvent.urls && selectedEvent.urls.length > 4) {
      selectedEvent.urls = selectedEvent.urls.slice(0, 4);
    }
  }

  onClickLeftButton() {}

  onClickRightButton() {}
}
