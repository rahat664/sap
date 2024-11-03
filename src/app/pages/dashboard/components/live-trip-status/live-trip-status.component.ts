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
  startingPosition: any[] = []
  destinationPosition: any[] = []
  tripStatus: string = 'In Progress';
  tripStatuses: { count: unknown; status: string }[];

  constructor(private service: TripService) {}

  ngOnInit() {
    this.getTripList();
  }

  private getTripList() {
    this.service.getTrips(0, 200).subscribe(res => {
      this.startingPosition = [];
      this.destinationPosition = [];
      res.data?.responses[0]?.tripPoints?.forEach((point: any) => {
        if (point.pointType === 'Loading') {
          this.startingPosition.push({
            lng: point.pointLon,
            lat: point.pointLat,
          })
        } else if (point.pointType === 'Unloading') {
          this.destinationPosition.push({
            lng: point.pointLon,
            lat: point.pointLat,
          });
        }
      });
      this.makeArrayFromThisObject(res.data.statusCount);
    });
  }

  private makeArrayFromThisObject(statusCount: any) {
    const status = Object.keys(statusCount);
    const count = Object.values(statusCount);
    this.tripStatuses = status.map((s, i) => {
      return {
        status: s,
        count: count[i],
      };
    });
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
