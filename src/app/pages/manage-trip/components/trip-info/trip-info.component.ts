import { Component, inject, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TripData } from '../../model/trip.details.model';
import { TripService } from '../../../trip-list/services/trip.service';
import { DialogDataComponent } from '../dialog-data/dialog-data.component';
import { ConfirmUpdateComponent } from '../confirm-update/confirm-update.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-trip-info',
  standalone: true,
  imports: [DatePipe, CommonModule],
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

  ngOnInit() {
    this.userName = localStorage.getItem('name');
    this.userPhone = localStorage.getItem('userPhoneNumber');
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
            text: `Do you want to mark the trip ${this.tripDetails.tripId} as completed?`,
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
}
