import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
  OnChanges,
} from '@angular/core';
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
import { Router } from '@angular/router';
import { ManualTrackingComponent } from '../manual-tracking/manual-tracking.component';

@Component({
  selector: 'app-trip-details',
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
    ManualTrackingComponent,
  ],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss',
})
export class TripDetailsComponent implements OnInit, OnChanges {
  readonly dialog = inject(MatDialog);
  buttonAvailable: boolean;
  onlyStatusTripEvents: any[];

  constructor(
    private mobileToggleService: ToggleResponsiveService,
    private trip: TripService,
    private router: Router
  ) {}

  tripTimeline: any[] = [
    {
      name: 'Created',
      dateTime: '2024-07-29T12:47:52.804726',
      dateTimeAvailable: true,
      active: true,
      truckInThisPoint: true,
      className: 'border border-green border-solid',
      cancelled: false,
    },
    {
      name: 'Booked',
      dateTime: '2021-09-01T00:00:00',
      dateTimeAvailable: false,
      active: false,
      truckInThisPoint: false,
      className: 'border border-line border-dashed',
      cancelled: false,
    },
    {
      name: 'Running',
      dateTime: '2021-09-01T00:00:00',
      dateTimeAvailable: false,
      active: false,
      truckInThisPoint: false,
      className: 'border border-line border-dashed',
      cancelled: false,
    },
    {
      name: 'Completed',
      dateTime: '2021-09-01T00:00:00',
      dateTimeAvailable: false,
      active: false,
      className: 'border border-line border-dashed',
      truckInThisPoint: false,
      cancelled: false,
    },
  ];

  @Input() tripDetails: TripData;
  @Output() foldUnfoldChange = new EventEmitter<boolean>();
  expanded = false;
  minimized = false;

  onClickExpand() {
    localStorage.setItem('expanded', 'true');
    if (this.minimized) {
      this.expanded = false;
      this.minimized = false;
    } else {
      this.expanded = true;
      this.mobileToggleService?.isSidebarOpen.next(true);
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
      if (simpleChanges.tripDetails?.currentValue?.status === 'Unassigned') {
        this.buttonAvailable = this.isAdmin();
      } else {
        this.buttonAvailable = true;
      }
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
    const onlyStatusTripEvents = [];
    if (currentValue.tripEvents) {
      currentValue.tripEvents.forEach(event => {
        if (event.name) {
          if (event.name === 'Trip cancelled' || event.name == 'Cancelled') {
            onlyStatusTripEvents.push(event);
          } else if (
            event.name === 'Trip booked' ||
            event.name === 'Trip started' ||
            event.name === 'Trip completed' ||
            event.name === 'Trip created'
          ) {
            onlyStatusTripEvents.push(event);
          }
        }
      });
      this.onlyStatusTripEvents = onlyStatusTripEvents;
      onlyStatusTripEvents?.forEach((event, index) => {
        if (event.name != 'Trip cancelled' && event.name != 'Cancelled') {
          this.tripTimeline[index].dateTime = event.createdAt;
          this.tripTimeline[index].dateTimeAvailable = true;
          this.tripTimeline[index].active = true;
          this.tripTimeline[index].truckInThisPoint = true;
          this.tripTimeline[index].className =
            'border border-green border-solid';
          this.makeOtherTruckInActive(index);
        } else {
          this.tripTimeline[index].dateTime = event.createdAt;
          this.tripTimeline[index].dateTimeAvailable = true;
          if (index > 0) {
            this.tripTimeline[index - 1].truckInThisPoint = true;
            this.makeOtherTruckInActive(index - 1);
          }
          this.tripTimeline[index].cancelled = true;
          this.makeOtherClosePointDisabled(index);
          this.tripTimeline[index].className =
            'border border-red border-dashed';
        }
      });
    }
  }

  private resetTripTimeline() {
    this.tripTimeline.forEach(event => {
      event.dateTime = new Date();
      event.dateTimeAvailable = false;
      event.active = false;
      event.className = 'border border-line border-dashed';
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
            text: `Do you want to start this trip?`,
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
      minWidth: '30rem',
      maxHeight: '90vw',
      data: {
        title: 'Attention',
        textPrefix: 'Do you want to cancel the trip ',
        text: `${this.tripDetails.tripId}?`,
        trip: this.tripDetails,
        reasonAvailable: true,
        buttonText: 'Cancel Trip',
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

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  onClickTripUpdate(tripDetails: TripData) {
    localStorage.setItem('updateTripDetails', JSON.stringify(tripDetails));
    this.router.navigate(['/update-trip']);
  }

  private makeOtherClosePointDisabled(index: number) {
    this.tripTimeline.forEach((event, i) => {
      if (i > index) {
        event.cancelled = false;
      }
    });
  }
}
