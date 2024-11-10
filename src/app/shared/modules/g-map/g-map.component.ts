import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
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
export class GMapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() tripStatus: string;
  @Input() lat: number;
  @Input() lng: number;
  @Input() starting: google.maps.LatLngLiteral = null;
  @Input() destination: google.maps.LatLngLiteral = null;
  @Input() truckLocationPosition: google.maps.LatLngLiteral = null;
  @Input() truckFullRegistrationNumber: string;

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
  truckLocationMarker: google.maps.Marker = null;
  startMarker: google.maps.MarkerOptions = {};
  endMarker: google.maps.MarkerOptions = {};
  polylines: google.maps.PolylineOptions[] = [];
  bottomHeight: string = '0px';
  infoWindow: any;
  truckData: TruckData = {} as TruckData;
  loading: boolean;
  private intervalData: number;
  private _truckId: string;

  constructor(
    private geoLocationService: GeolocationService,
    private trip: TripService,
    private truckService: TrackerService
  ) {}

  ngOnInit(): void {
    this.trip.bottomHeight.subscribe((height) => {
      this.bottomHeight = height;
    });

    // Initial location setup
    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      const location = JSON.parse(currentLocation);
      this.center = location;
      this.setInitialMarker(location);
    } else {
      this.geoLocationService.getCurrentPosition().then((position) => {
        this.center = { lat: position.latitude, lng: position.longitude };
        this.setInitialMarker(this.center);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['starting'] || changes['destination']) {
      this.updateRoute();
    }
    if (changes['truckLocationPosition']) {
      this.updateTruckLocation();
    }
  }

  ngAfterViewInit() {
  }


  private setInitialMarker(location: google.maps.LatLngLiteral): void {
    this.initialMarker = {
      position: location,
      icon: {
        url: '/assets/images/focus.png',
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Current Location',
    };
  }

  private updateRoute(): void {
    const start = this.starting;
    const end = this.destination;

    if (start && end && start.lng > 0 && start.lat > 0 && end.lng > 0 && end.lat > 0) {
      this.clearPolylines();
      this.initialMarker = {}; // Clear initial marker when route is being set
      const request: google.maps.DirectionsRequest = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: { departureTime: new Date() },
      };

      this.directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(result);
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(start);
          bounds.extend(end);
          this.map?.googleMap?.fitBounds(bounds);
          this.updatePolylineWithTraffic(result);
        }
      });
    } else {
      this.resetMarkers();
    }
  }

  private updateTruckLocation(): void {
    if (this.truckLocationPosition?.lat && this.truckLocationPosition?.lng && this.tripStatus !== 'Completed' && this.tripStatus !== 'Cancelled') {
      if (this.truckLocationMarker) {
        // Update existing marker position
        this.truckLocationMarker.setPosition(this.truckLocationPosition);
      } else {
        // Create new marker
        this.truckLocationMarker = new google.maps.Marker({
          position: this.truckLocationPosition,
          icon: {
            url: '/assets/svg/truck-map.svg',
            scaledSize: new google.maps.Size(48, 48),
          },
          title: 'Truck Location',
          map: this.map?.googleMap,
        });

        // Add InfoWindow and click event for fetching truck data
        this.infoWindow = new google.maps.InfoWindow({
          content: this.getLoadingSpinnerContent(),
          maxWidth: 400,
        });


        this.truckLocationMarker.addListener('click', () => {
          this.loading = true;
          this.infoWindow.setContent(this.getLoadingSpinnerContent());
          this.showLoadingSpinner();
          this.fetchTruckData();
        });
      }
      this.adjustMapToTruckPosition();
    } else {
        this.removeTruckMarker()
        this.truckLocationMarker=null
    }
  }

  private adjustMapToTruckPosition(): void {
    if (this.map?.googleMap && this.truckLocationPosition) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(this.starting);
      bounds.extend(this.destination);
      bounds.extend(this.truckLocationPosition)
      this.map.googleMap.fitBounds(bounds); // Ensure the map adjusts to the truck location
    }
  }

  private removeTruckMarker(): void {
    if (this.truckLocationMarker) {
      this.truckLocationMarker.setMap(null);
      this.truckLocationMarker = null;

    }
  }

  private resetMarkers(): void {
    this.center = { lat: 23.8041, lng: 90.4125 }; // Default fallback position
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(this.center);
    this.map?.googleMap?.fitBounds(bounds);
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
    this.clearPolylines();
  }

  private updatePolylineWithTraffic(directionsResult: google.maps.DirectionsResult): void {
    const route = directionsResult.routes[0];

    this.startMarker = {
      position: route.legs[0].start_location.toJSON(),
      icon: {
        url: '/assets/svg/start.svg',
        scaledSize: new google.maps.Size(30, 30),
      },
      title: route.legs[0].start_address,
    };

    this.endMarker = {
      position: route.legs[route.legs.length - 1].end_location.toJSON(),
      icon: {
        url: '/assets/svg/end.svg',
        scaledSize: new google.maps.Size(30, 30),
      },
      title: route.legs[route.legs.length - 1].end_address,
    };

    this.polylines = route.legs.flatMap(leg =>
      leg.steps.map(step => ({
        path: step.path.map(latlng => latlng.toJSON()),
        strokeColor: '#11484F',
        strokeOpacity: 1,
        strokeWeight: 4,
      }))
    );
  }

  private clearPolylines(): void {
    this.polylines = [];
  }

  private fetchTruckData(): void {
    this.truckService.getTrackers(0, 10, this.truckFullRegistrationNumber).subscribe(
      (res: any) => {
        if (res.data?.content?.length > 0) {
          this._truckId = res.data.content[0].vehicleId;
          this.truckService.getTrackerData(this._truckId).subscribe(
            (res: any) => {
              this.truckData = res.data;
              this.updateInfoWindow();
              this.startInterval();
            },
            error => console.log(error)
          );
        }
      },
      error => console.log(error)
    );
  }

  private startInterval(): void {
    if (this.intervalData) {
      clearInterval(this.intervalData);
    }
    this.intervalData = window.setInterval(() => {
      this.truckService.getTrackerData(this._truckId).subscribe(
        (res: any) => {
          this.truckData = res.data;
          this.updateInfoWindow();
        },
        error => console.log(error)
      );
    }, 5000);
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

  showLoadingSpinner(): void {
    this.loading = true;
    this.infoWindow.setContent(this.getLoadingSpinnerContent());
    this.infoWindow.open(this.map, this.truckLocationMarker);
  }

  getLoadingSpinnerContent(): string {
    return `
      <div style="text-align: center; padding: 20px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
        <p>Loading...</p>
      </div>
    `;
  }

  ngOnDestroy(): void {
    if (this.intervalData) {
      clearInterval(this.intervalData);
    }
  }

  private stopInterval() {
    clearInterval(this.intervalData);
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
}
