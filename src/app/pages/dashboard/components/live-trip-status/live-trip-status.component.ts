import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
import { TripService } from '../../../trip-list/services/trip.service';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-live-trip-status',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, GMapComponent, NgForOf],
  templateUrl: './live-trip-status.component.html',
  styleUrl: './live-trip-status.component.scss',
})
export class LiveTripStatusComponent {
  startingPosition: any[] = [];
  destinationPosition: any[] = [];
  tripStatus: string = 'In Progress';
  tripStatuses: { count: unknown; status: string }[];

  constructor(private service: TripService) {}

  ngOnInit() {
    this.getTripList();
  }

  private getTripList() {
    const tripParams = {
      page: 0, // Starting page
      size: 200,
    };

    // Calling the getTrips method with the object as parameter
    this.service.getTrips(0, 200).subscribe(
      (res: any) => {
        // Destructure the response to access tripPoints and statusCount
        const { tripPoints, statusCount } = res.data?.responses[0] || {};

        // Reset the positions
        this.startingPosition = [];
        this.destinationPosition = [];

        // Process the trip points
        if (tripPoints) {
          tripPoints.forEach((point: any) => {
            const { pointType, pointLon, pointLat } = point;
            const position = { lng: pointLon, lat: pointLat };

            // Check the pointType and push to the corresponding array
            if (pointType === 'Loading') {
              this.startingPosition.push(position);
            } else if (pointType === 'Unloading') {
              this.destinationPosition.push(position);
            }
          });
        }

        // Handle the status count
        if (statusCount) {
          this.makeArrayFromThisObject(statusCount);
        }
      },
      error => {
        console.error('Error fetching trip list:', error);
        // Optionally show an error message via toaster or other UI feedback
      }
    );
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
