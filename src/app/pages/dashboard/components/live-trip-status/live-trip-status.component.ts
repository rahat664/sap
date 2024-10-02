import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';

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
  ],
  templateUrl: './live-trip-status.component.html',
  styleUrl: './live-trip-status.component.scss',
})
export class LiveTripStatusComponent {
  truckLocationPosition: google.maps.LatLngLiteral = null;
  startingPosition: google.maps.LatLngLiteral = {
    lat: 23.8103,
    lng: 90.4125,
  };
  destinationPosition: google.maps.LatLngLiteral = {
    lat: 23.8103,
    lng: 90.4125,
  };
  tripStatus: string = 'In Progress';
}
