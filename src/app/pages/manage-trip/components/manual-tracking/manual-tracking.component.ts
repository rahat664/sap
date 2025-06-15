import { Component, Input } from '@angular/core';
import { TripData, TripEvent } from '../../model/trip.details.model';
import { DatePipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-manual-tracking',
  imports: [NgForOf, DatePipe, NgIf],
  templateUrl: './manual-tracking.component.html',
  styleUrl: './manual-tracking.component.scss',
})
export class ManualTrackingComponent {
  @Input() tripDetails!: TripData;
  manualTrackingEvents: TripEvent[] = [];

  ngOnChanges() {
    if (this.tripDetails) {
      this.getTripEventsOfManualTracking();
    }
  }

  private getTripEventsOfManualTracking() {
    this.manualTrackingEvents = this.tripDetails?.tripEvents.filter(
      (event: TripEvent) => event.eventType === 'MANUAL_TRACKING'
    );
  }
}
