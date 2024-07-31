import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToggleResponsiveService } from '../../../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { TripData } from '../../model/trip.details.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TripInfoComponent } from '../trip-info/trip-info.component';
import { TripActivityComponent } from '../trip-activity/trip-activity.component';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    MatTabGroup,
    MatTab,
    TripInfoComponent,
    TripActivityComponent,
  ],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss',
})
export class TripDetailsComponent {
  constructor(private mobileToggleService: ToggleResponsiveService) {}

  tripTimeline: any[] = [
    {
      name: 'Created',
      dateTime: '2024-07-29T12:47:52.804726',
      dateTimeAvailable: true,
      active: true,
      truckInThisPoint: true,
    },
    {
      name: 'Booked',
      dateTime: '2021-09-01T00:00:00',
      dateTimeAvailable: false,
      active: false,
      truckInThisPoint: false,
    },
    {
      name: 'Running',
      dateTime: '2021-09-01T00:00:00',
      dateTimeAvailable: false,
      active: false,
      truckInThisPoint: false,
    },
    {
      name: 'Completed',
      dateTime: '2021-09-01T00:00:00',
      dateTimeAvailable: false,
      active: false,
      truckInThisPoint: false,
    },
  ];

  @Input() tripDetails: TripData;
  expanded: boolean = true;
  minimized: boolean = false;

  onClickExpand() {
    if (this.minimized) {
      this.expanded = false;
      this.minimized = false;
    } else {
      this.expanded = true;
      this.mobileToggleService.isSidebarOpen.next(true);
    }
  }

  onCLickMinimize() {
    this.minimized = true;
    this.mobileToggleService.isSidebarOpen.next(false);
  }

  ngOnChanges(simpleChanges: any) {
    if (simpleChanges.tripDetails) {
      this.changeTripTimeline(simpleChanges.tripDetails.currentValue);
    }
  }

  private changeTripTimeline(currentValue: TripData) {
    this.resetTripTimeline();
    currentValue.tripEvents.forEach((event, index) => {
      this.tripTimeline[index].dateTime = event.createdAt;
      this.tripTimeline[index].dateTimeAvailable = true;
      this.tripTimeline[index].active = true;
      this.tripTimeline[index].truckInThisPoint = true;
      this.makeOtherTruckInActive(index);
    });
  }

  private resetTripTimeline() {
    this.tripTimeline.forEach(event => {
      event.dateTime = new Date();
      event.dateTimeAvailable = false;
      event.active = false;
    });
  }

  private makeOtherTruckInActive(index: number) {
    this.tripTimeline.forEach((event, i) => {
      if (i !== index) {
        event.truckInThisPoint = false;
      }
    });
  }

  onClickFold() {
    this.expanded = false;
    this.minimized = false;
    this.mobileToggleService.isSidebarOpen.next(false);
  }
}
