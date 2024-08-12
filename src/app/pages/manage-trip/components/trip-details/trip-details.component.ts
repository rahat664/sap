import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToggleResponsiveService } from '../../../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { TripData } from '../../model/trip.details.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TripInfoComponent } from '../trip-info/trip-info.component';
import { TripActivityComponent } from '../trip-activity/trip-activity.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogDataComponent } from '../dialog-data/dialog-data.component';
import { ConfirmUpdateComponent } from '../confirm-update/confirm-update.component';
import { TripService } from '../../../trip-list/services/trip.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { ConfirmCancelComponent } from '../confirm-cancel/confirm-cancel.component';

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
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss',
})
export class TripDetailsComponent {
  readonly dialog = inject(MatDialog);

  constructor(
    private mobileToggleService: ToggleResponsiveService,
    private trip: TripService
  ) {}

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
  @Output() foldUnfoldChange = new EventEmitter<boolean>();
  expanded: boolean = false;
  minimized: boolean = false;

  onClickExpand() {
    localStorage.setItem('expanded', 'true');
    if (this.minimized) {
      this.expanded = false;
      this.minimized = false;
    } else {
      this.expanded = true;
      this.mobileToggleService.isSidebarOpen.next(true);
      this.foldUnfoldChange.emit(true);
    }
  }

  ngOnInit() {
    this.trip.reloadManageTripPage.subscribe(value => {
      if (value) {
        this.expanded = localStorage.getItem('expanded') === 'true';
      } else {
        this.expanded = false;
      }
    });
  }

  onCLickMinimize() {
    this.minimized = true;
    this.expanded = false;
    this.mobileToggleService.isSidebarOpen.next(false);
    this.foldUnfoldChange.emit(false);
  }

  ngOnChanges(simpleChanges: any) {
    if (simpleChanges.tripDetails) {
      this.trip.reloadManageTripPage.subscribe(value => {
        if (value) {
          this.expanded = localStorage.getItem('expanded') === 'true';
        } else {
          this.expanded = false;
        }
      });
      this.minimized = false;
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
    this.foldUnfoldChange.emit(false);
  }

  getButtonName(status: string | undefined) {
    switch (status) {
      case 'Unassigned':
        return 'Book Trip';
      case 'Booked':
        return 'Start Trip';
      case 'Running':
        return 'Complete Trip';
      default:
        return 'Book Trip';
    }
  }

  onClickButton() {
    if (this.tripDetails.status === 'Unassigned') {
      const dialogRef = this.dialog.open(DialogDataComponent, {
        width: '47.25rem',
        height: '52.25rem',
        data: {
          buttonName: 'Book Trip',
          trip: this.tripDetails,
        },
      });
    } else if (this.tripDetails.status === 'Booked') {
      if (this.tripDetails.truck && this.tripDetails.driverCode) {
        const dialogRef = this.dialog.open(ConfirmUpdateComponent, {
          width: '21.375rem',
          data: {
            title: 'Start Trip?',
            text: `Do you want to mark the trip ${this.tripDetails.tripId} as booked?`,
            buttonText: 'Yes',
            trip: this.tripDetails,
          },
        });
      } else {
        const dialogRef = this.dialog.open(DialogDataComponent, {
          width: '47.25rem',
          height: '52.25rem',
          data: {
            buttonName: 'Start Trip',
            trip: this.tripDetails,
          },
        });
      }
    } else {
      const dialogRef = this.dialog.open(ConfirmUpdateComponent, {
        width: '21.375rem',
        data: {
          title: 'Complete Trip?',
          text: `Do you want to mark the trip ${this.tripDetails.tripId} as completed?`,
          buttonText: 'Yes',
          trip: this.tripDetails,
        },
      });
    }
  }

  onClickTripCancel() {
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      width: '21.375rem',
      data: {
        title: 'Cancel Trip?',
        text: `Do you want to cancel the trip ${this.tripDetails.tripId}?`,
        trip: this.tripDetails,
      },
    });
  }

  getAssignButtonName(tripDetails: TripData) {
    if (tripDetails.truck && tripDetails.driverCode) {
      return '';
    } else if (tripDetails.truck && !tripDetails.driverCode) {
      return 'Assign Driver';
    } else if (!tripDetails.truck && tripDetails.driverCode) {
      return 'Assign Truck';
    } else {
      return 'Assign Truck & Driver';
    }
  }

  onClickAssignButton() {
    let buttonName = '';
    if (this.tripDetails.truck && this.tripDetails.driverCode) {
      buttonName = '';
    } else if (this.tripDetails.truck && !this.tripDetails.driverCode) {
      buttonName = 'Assign Driver';
    } else if (!this.tripDetails.truck && this.tripDetails.driverCode) {
      buttonName = 'Assign Truck';
    } else {
      buttonName = 'Assign Truck & Driver';
    }
    const dialogRef = this.dialog.open(DialogDataComponent, {
      width: '47.25rem',
      data: {
        buttonName: buttonName,
        trip: this.tripDetails,
      },
    });
  }
}
