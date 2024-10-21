import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GeolocationService } from '../../services/location/geolocation.service';
import { mapStyles } from '../../models/map-options';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { NgForOf, NgIf } from '@angular/common';
import { TripService } from '../../../pages/trip-list/services/trip.service';
import { TruckData } from '../../models/truck-data.model';
import { TrackerService } from '../../../pages/profiles/services/tracker.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-g-map',
  standalone: true,
  imports: [GoogleMapsModule, GoogleMap, NgIf, NgForOf],
  templateUrl: './g-map.component.html',
  styleUrls: ['./g-map.component.scss'],
})
export class GMapComponent implements OnInit, OnChanges {
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
  @Input() lat: number;
  @Input() lng: number;
  @Input() starting: google.maps.LatLngLiteral[] = [];
  @Input() destination: google.maps.LatLngLiteral[] = [];
  @Input() truckLocationPosition: google.maps.LatLngLiteral;

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
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
  });

  initialMarker: google.maps.MarkerOptions = {};
  truckLocationMarker: google.maps.Marker = null; // Change to google.maps.Marker
  startMarker: google.maps.MarkerOptions = {};
  endMarker: google.maps.MarkerOptions = {};
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

    if (this.starting.length > 0 && this.destination.length > 0) {
      this.updateRoute();
    }

    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      this.center = JSON.parse(currentLocation);
      this.initialMarker = {
        position: this.center,
        icon: {
          url: '/assets/images/focus.png',
          scaledSize: new google.maps.Size(30, 30),
        },
        // api call and show when hover
        title: 'Current Location',
      };
    } else {
      this.geoLocationService.getCurrentPosition().then(position => {
        this.center = { lat: position.latitude, lng: position.longitude };
        this.initialMarker = {
          position: this.center,
          icon: {
            url: '/assets/images/focus.png',
            scaledSize: new google.maps.Size(30, 30),
          },
          title: 'Current Location',
        };
      });
    }
  }

  showLoadingSpinner(): void {
    this.loading = true;
    this.infoWindow.setContent(this.getLoadingSpinnerContent());
    this.infoWindow.open(this.map, this.truckLocationMarker);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (this.starting.length > 0 && this.destination.length > 0) {
        this.updateRoute();
      }
    }
    if (changes['truckLocationPosition']) {
      this.updateTruckLocation();
    }
  }

  private updateRoute() {
    const startPoints: google.maps.LatLngLiteral[] = this.starting;

    const endPoints: google.maps.LatLngLiteral[] = this.destination;

    this.clearInput.emit(true);

    console.log(startPoints, endPoints);

    this.clearPolylines();
    this.initialMarker = {};

    // Connect starting points sequentially
    for (let i = 0; i < startPoints.length - 1; i++) {
      this.connectPoints(startPoints[i], startPoints[i + 1], 'loading');
    }

    // Connect the last starting point with the first destination point
    this.connectPoints(
      startPoints[startPoints.length - 1],
      endPoints[0],
      'unloading'
    );

    // Connect destination points sequentially
    for (let i = 0; i < endPoints.length - 1; i++) {
      this.connectPoints(endPoints[i], endPoints[i + 1], 'unloading');
    }
  }

  // Connects two points and renders the route
  private connectPoints(
    start: google.maps.LatLngLiteral,
    end: google.maps.LatLngLiteral,
    pointType: string
  ) {
    if (start && end) {
      const request: google.maps.DirectionsRequest = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
        },
      };

      this.directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          if (pointType === 'loading') {
            this.setLoadingMarker(start);
          } else if (pointType === 'unloading') {
            this.setUnloadingMarker(end);
          }

          const bound = new google.maps.LatLngBounds();
          bound.extend(start);
          bound.extend(end);
          this.map.googleMap.fitBounds(bound);

          this.updatePolylineWithTraffic(result);
        } else {
          console.error('Error fetching directions', status);
        }
      });
    }
  }

  private setLoadingMarker(position: google.maps.LatLngLiteral) {
    const loadingMarker = new google.maps.Marker({
      position: position,
      icon: {
        url: '/assets/svg/start.svg', // Replace with your custom loading marker icon
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Loading Point',
      map: this.map.googleMap,
    });
  }

  private setUnloadingMarker(position: google.maps.LatLngLiteral) {
    const unloadingMarker = new google.maps.Marker({
      position: position,
      icon: {
        url: '/assets/svg/end.svg', // Replace with your custom unloading marker icon
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Unloading Point',
      map: this.map.googleMap,
    });
  }

  private updateTruckLocation() {
    if (
      this.truckLocationPosition?.lat &&
      this.truckLocationPosition?.lng &&
      this.tripStatus != 'Completed' &&
      'Cancelled'
    ) {
      if (this.truckLocationMarker) {
        // Update existing marker position
        this.truckLocationMarker.setPosition(this.truckLocationPosition);
      } else {
        // Create and add marker to the map
        this.truckLocationMarker = new google.maps.Marker({
          position: this.truckLocationPosition,
          icon: {
            url: '/assets/svg/truck-map.svg',
            scaledSize: new google.maps.Size(48, 48),
          },
          title: 'Truck Location',
          map: this.map.googleMap, // Add marker to the map
          // implement when click on marker
        });
      }

      // Create InfoWindow
      this.infoWindow = new google.maps.InfoWindow({
        content: this.getLoadingSpinnerContent(), // Initially show spinner
        maxWidth: 400,
      });

      // Add marker click listener to open InfoWindow and fetch data
      this.truckLocationMarker.addListener('click', () => {
        this.showLoadingSpinner(); // Show loading spinner
        this.fetchTruckData(); // Fetch data from API
      });
    } else {
      if (this.truckLocationMarker) {
        // Remove marker from the map
        this.truckLocationMarker.setMap(null);
        this.truckLocationMarker = null;
      }
    }
  }

  private resetMarkers() {
    this.center = {
      lat: 23.8041,
      lng: 90.4125,
    };
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(this.center);
    this.map.googleMap.fitBounds(bounds);
    this.endMarker = {};
    this.initialMarker = {
      position: this.center,
      icon: {
        url: '/assets/images/focus.png',
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Current Location',
      clickable: true,
    };
    this.directionsRenderer.setMap(null);
    this.clearPolylines();
  }

  private updatePolylineWithTraffic(
    directionsResult: google.maps.DirectionsResult
  ): void {
    directionsResult.routes.forEach(route => {
      route.legs.forEach(leg => {
        leg.steps.forEach(step => {
          const polyline = new google.maps.Polyline({
            path: step.path.map(latlng => latlng.toJSON()),
            strokeColor: '#11484F', // Polyline color
            strokeOpacity: 1,
            strokeWeight: 4,
          });
          polyline.setMap(this.map.googleMap);
          // Store the polyline for management
        });
      });
    });
  }

  private clearPolylines(): void {
    this.polylines = [];
  }

  fetchTruckData(): void {
    this.truckService
      .getTrackers(0, 10, this.truckFullRegistrationNumber)
      .subscribe(
        (res: any) => {
          if (res.data?.content?.length > 0) {
            this._truckId = res.data.content[0].vehicleId;
            this.truckService.getTrackerData(this._truckId).subscribe(
              (res: any) => {
                this.truckData = res.data;
                this.updateInfoWindow();
                this.startInterval();
              },
              error => {
                console.log(error);
              }
            );
          }
        },
        error => {
          console.log(error);
        }
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

  updateInfoWindow(): void {
    this.infoWindow.setContent(this.getInfoWindowContent());
    this.infoWindow.open(this.map, this.truckLocationMarker);

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
          <div style="font-weight: bold; font-size: 16px">${this.truckData.numberPlate}</div>
          <div style="font-weight: 500; font-size: 14px; line-height: 20px">${this.truckData.address.split(',')[0]}</div>
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

  private startInterval() {
    this.intervalData = setInterval(() => {
      this.updateTruckDataOnly();
      this.stopInterval();
    }, 3900);
  }

  private stopInterval() {
    clearInterval(this.intervalData);
  }

  private updateTruckDataOnly() {
    this.truckService.getTrackerData(this._truckId).subscribe(
      (res: any) => {
        this.truckData = res.data;
        this.startInterval();
        this.updateInfoWindow();
      },
      error => {
        console.log(error);
      }
    );
  }
}
