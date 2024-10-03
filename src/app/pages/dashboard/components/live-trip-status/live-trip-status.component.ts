import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
import { TripService } from '../../../trip-list/services/trip.service';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-live-trip-status',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    GMapComponent,
    NgForOf,
  ],
  templateUrl: './live-trip-status.component.html',
  styleUrl: './live-trip-status.component.scss',
})
export class LiveTripStatusComponent {
  startingPosition: google.maps.LatLngLiteral = {
    lat: 23.8103,
    lng: 90.4125,
  };
  destinationPosition: google.maps.LatLngLiteral = {
    // rangpur coordinates
    lat: 23.8103,
    lng: 90.4125,
  };
  tripStatus: string = 'In Progress';
  tripStatuses: { count: unknown; status: string }[];

  constructor(private service: TripService) {}

  ngOnInit() {
    this.getTripList();
  }

  private getTripList() {
    this.service.getTrips(0, 200).subscribe(res => {
      this.makeArrayFromThisObject(res.data.statusCount);
    });
  }

  private makeArrayFromThisObject(statusCount: any) {
    const status = Object.keys(statusCount);
    const count = Object.values(statusCount);
    const statusArray = status.map((s, i) => {
      return {
        status: s,
        count: count[i],
      };
    });
    this.tripStatuses = statusArray;
  }

  getColorByStatus(status: string) {
    switch (status) {
      case 'All':
        return 'bg-black';
      case 'Booked':
        return 'bg-another';
      case 'Completed':
        return 'bg-blue';
      case 'Running':
        return 'bg-green';
      case 'Unassigned':
        return 'bg-red';
      case 'Cancelled':
        return 'bg-cancel';
      default:
        return 'bg-another';
    }
  }
}
