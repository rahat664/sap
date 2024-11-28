import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { mapStyles } from '../../../../../shared/models/map-options';
import { GoogleMap } from '@angular/google-maps';
import { TruckData } from '../../../../../shared/models/truck-data.model';
import { CommonModule } from '@angular/common';
import { GeolocationService } from '../../../../../shared/services/location/geolocation.service';
import { TripService } from '../../../../trip-list/services/trip.service';
import { TrackerService } from '../../../services/tracker.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-trucking-map',
  standalone: true,
  imports: [GoogleMap, CommonModule],
  templateUrl: './trucking-map.component.html',
  styleUrl: './trucking-map.component.scss',
})
export class TruckingMapComponent {
  @Output() clearInput: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  get truckId(): string {
    return this._truckId;
  }

  set truckId(value: string) {
    this._truckId = value;
  }

  @Input() tripStatus: string;
  @Input() lat: number = 23.8103;
  // Dhaka lat
  @Input() lng: number = 90.4125;
  @Input() starting: google.maps.LatLngLiteral[] = [];
  @Input() destination: google.maps.LatLngLiteral[] = [];
  @Input() truckLocationPosition: any[] = [];
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;

  center: google.maps.LatLngLiteral;
  zoom = 12;
  options: google.maps.MapOptions = {
    styles: mapStyles,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    disableDefaultUI: true,
  };

  truckLocationMarker: google.maps.Marker[] = [];

  polylines: google.maps.PolylineOptions[] = [];
  bottomHeight: string = '0px';
  infoWindow: any;
  truckData: TruckData = {} as TruckData;
  loading: boolean;
  @Input() truckFullRegistrationNumber: string;
  private intervalData: number;
  private _truckId: string;

  constructor(
    private geoLocationService: GeolocationService,
    private trip: TripService,
    private truckService: TrackerService
  ) {}

  ngOnInit(): void {
    this.trip.bottomHeight.subscribe(height => {
      this.bottomHeight = height;
    });
    this.center = {
      lat: this.lat,
      lng: this.lng,
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.truckLocationPosition.length > 0) {
        this.updateTruckLocation(this.truckLocationPosition);
      }
    }, 2000);
  }

  showLoadingSpinner(marker: google.maps.Marker): void {
    this.loading = true;
    this.infoWindow.setContent(this.getLoadingSpinnerContent());
    this.infoWindow.open(this.map, marker);
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      if (changes['truckLocationPosition']?.currentValue) {
        console.log(this.truckLocationPosition.length);
        this.updateTruckLocation(this.truckLocationPosition);
      }
    }, 2000);
  }

  private updateTruckLocation(truckPosition?: any): void {
    // Check if truckLocationPosition contains data
    if (this.truckLocationMarker.length > 0) {
      // Clear the markers if they exist
      this.truckLocationMarker.forEach(marker => {
        marker.setMap(null);
      });
      this.truckLocationMarker = [];
    }
    if (truckPosition && truckPosition?.length > 0) {
      // Clear the marker if it exists
      // Loop through the truck locations and add a marker for each
      truckPosition.forEach((truck, index) => {
        // bound the map so that all markers are visible
        this.map.googleMap?.fitBounds({
          north: truck.position.lat + 1.2,
          south: truck.position.lat - 1.2,
          east: truck.position.lng + 1.2,
          west: truck.position.lng - 1.2,
        });

        // Create a new marker for each truck
        const truckLocationMarker = new google.maps.Marker({
          position: truck.position,
          icon: {
            url: `/assets/svg/trucking-${truck?.image}.svg`, // Set appropriate icon
            scaledSize: new google.maps.Size(48, 48), // Set appropriate size
          },
          title: 'Truck Location ' + (index + 1),
          map: this.map.googleMap, // Ensure the map is set
        });
        this.truckLocationMarker.push(truckLocationMarker);

        // Create an InfoWindow for this marker

        // Add a click event listener to the marker to show info when clicked
      });
    } else {
      // If no truck location data is available, you can clear markers here if needed
      console.log('No truck location data available');
    }
    this.truckLocationMarker.forEach((marker, index) => {
      this.infoWindow = new google.maps.InfoWindow({
        content: this.getLoadingSpinnerContent(), // Initially show loading spinner
        maxWidth: 400,
      });
      marker.addListener('click', (registrationNumber: string) => {
        if (this.intervalData) {
          this.infoWindow.close();
          this.stopInterval();
        }
        this.showLoadingSpinner(marker);
        this.fetchTruckData(
          truckPosition[index].fullRegistrationNumber,
          marker
        );
      });
    });
  }

  private clearPolylines(): void {
    this.polylines = [];
    this.starting = [];
    this.destination = [];
  }

  fetchTruckData(registrationNumber: string, marker: any): void {
    this.truckService.getTrackers(0, 10, registrationNumber).subscribe(
      (res: any) => {
        if (res.data?.content?.length > 0) {
          this._truckId = res.data.content[0].vehicleId;
          this.truckService.getTrackerData(this._truckId).subscribe(
            (res: any) => {
              this.truckData = res.data;
              this.updateInfoWindow(marker);
              this.startInterval(marker);
            },
            error => {}
          );
        }
      },
      error => {}
    );
  }

  calculatedHeight() {
    if (this.bottomHeight === '0px') {
      return '100%';
    } else {
      return (
        window.innerHeight - Number(this.bottomHeight.split('px')[0]) + 'px'
      );
    }
  }

  updateInfoWindow(marker: any): void {
    this.infoWindow.setContent(this.getInfoWindowContent());
    this.infoWindow.open(this.map, marker);

    // Add event listener for the close button
    timer(100).subscribe(() => {
      const closeBtn = document.getElementById('closeBtn');
      closeBtn.addEventListener('click', () => {
        this.infoWindow.close();
        this.stopInterval();
      });
    });
    // Delay to allow the DOM to render
  }

  getInfoWindowContent(): string {
    return `
      <div style="display: flex; justify-content: space-between; align-items: start; padding: 1rem 0;">
        <div class="flex flex-col space-y-1">
          <div style="font-weight: 500; font-size: 14px; line-height: 20px">${this.truckData.numberPlate}</div>
          <div style="font-size: 12px; color: #777777">${this.truckData.address}</div>
        </div>
        <button id="closeBtn" style="background: transparent; border: none; cursor: pointer;">
          <i class="far fa-times cursor-pointer"></i>
        </button>
      </div>
      <div  id="info-body" style="background: #F5FBFC; padding: 0.5rem; font-size: 12px; color: #242424">
        <table id="info-table" style="width: 100%;">
          <tr class="grid grid-cols-8 "><td class="col-span-3">Time</td><td>:</td><td class="col-span-4">${this.truckData.time ? this.truckData.time : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Stop Duration<td>:</td></td><td class="col-span-4">${this.truckData.stopDuration ? this.truckData.stopDuration : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Engine<td>:</td></td><td class="col-span-4">${this.truckData.engineStatus ? this.truckData.engineStatus : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">GSM<td>:</td></td><td class="col-span-4">${this.truckData.gsmValue ? this.truckData.gsmValue : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Speed<td>:</td></td><td class="col-span-4">${this.truckData.speed ? this.truckData.speed : 'N/A'}</td></tr>
        </table>
      </div>
    `;
  }

  getLoadingSpinnerContent(): string {
    return `
      <div style="text-align: center; padding: 20px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
        <p>Loading...</p>
      </div>
    `;
  }

  private startInterval(marker: any) {
    this.intervalData = setInterval(() => {
      this.updateTruckDataOnly(marker);
      this.stopInterval();
    }, 3900);
  }

  private stopInterval() {
    clearInterval(this.intervalData);
  }

  private updateTruckDataOnly(marker: any) {
    this.truckService.getTrackerData(this._truckId).subscribe(
      (res: any) => {
        this.truckData = res.data;
        this.startInterval(marker);
        this.updateInfoWindow(marker);
      },
      error => {}
    );
  }
}
