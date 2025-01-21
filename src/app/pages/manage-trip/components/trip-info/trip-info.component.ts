import { Component, inject, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TripData, TripPoint } from '../../model/trip.details.model';
import { TripService } from '../../../trip-list/services/trip.service';
import { DialogDataComponent } from '../dialog-data/dialog-data.component';
import { ConfirmUpdateComponent } from '../confirm-update/confirm-update.component';
import { MatDialog } from '@angular/material/dialog';
import { NumberSeperatorPipe } from '../../../../shared/pipes/number-seperator.pipe';

@Component({
  selector: 'app-trip-info',
  standalone: true,
  imports: [DatePipe, CommonModule, NumberSeperatorPipe],
  templateUrl: './trip-info.component.html',
  styleUrl: './trip-info.component.scss',
})
export class TripInfoComponent {
  readonly dialog = inject(MatDialog);
  userName: string;
  userPhone: string;

  constructor(private trip: TripService) {}

  @Input() tripTimeline: any;
  @Input() tripDetails: TripData;
  protected readonly Number = Number;
  buttonAvailable: boolean;

  ngOnInit() {
    this.userName = localStorage.getItem('name');
    this.userPhone = localStorage.getItem('userPhoneNumber');
    if (this.tripDetails.status === 'Unassigned') {
      this.buttonAvailable = this.isAdmin();
    } else {
      this.buttonAvailable = true;
    }
  }

  getButtonName(status: string | undefined) {
    switch (status) {
      case 'Unassigned':
        this.buttonAvailable = this.isAdmin();
        return 'Book Trip';
      case 'Booked':
        this.buttonAvailable = true;
        return 'Start Trip';
      case 'Running':
        this.buttonAvailable = true;
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

  copyNumber($event, createdByPhone: string) {
    $event.stopPropagation();
    this.trip.copyToClipboard(createdByPhone);
  }

  getLoadingPoint(tripPoints: TripPoint[]) {
    return tripPoints.filter(point => point.pointType === 'Loading');
  }

  getUnloadingPoint(tripPoints: TripPoint[]) {
    return tripPoints.filter(point => point.pointType === 'Unloading');
  }
}
