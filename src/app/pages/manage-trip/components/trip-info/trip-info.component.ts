import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TripData } from '../../model/trip.details.model';
import { TripService } from '../../../trip-list/services/trip.service';

@Component({
  selector: 'app-trip-info',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './trip-info.component.html',
  styleUrl: './trip-info.component.scss',
})
export class TripInfoComponent {
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
}
