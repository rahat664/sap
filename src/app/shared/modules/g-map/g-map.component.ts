import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GeolocationService } from '../../services/location/geolocation.service';
import { mapStyles } from '../../models/map-options';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { NgForOf, NgIf } from '@angular/common';
import { TripService } from '../../../pages/trip-list/services/trip.service';
import { TruckData } from '../../models/truck-data.model';
import { TruckService } from '../../../pages/profiles/components/truck/services/truck.service';
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
  @Input() tripStatus: string;
  @Input() lat: number;
  @Input() lng: number;
  @Input() starting: google.maps.LatLngLiteral;
  @Input() destination: google.maps.LatLngLiteral;
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

  constructor(
    private geoLocationService: GeolocationService,
    private trip: TripService,
    private truckService: TrackerService
  ) {}

  ngOnInit(): void {
    this.trip.bottomHeight.subscribe(height => {
      this.bottomHeight = height;
    });

    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      const location = JSON.parse(currentLocation);
      this.center = location;
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
    if (changes['starting'] || changes['destination']) {
      this.updateRoute();
    }
      if (changes['truckLocationPosition']) {
        console.log(changes['truckLocationPosition']);
        this.updateTruckLocation();
      }
  }

  private updateRoute() {
    const start = this.starting;
    const end = this.destination;

    if (
      start &&
      start.lng > 0 &&
      start.lat > 0 &&
      end &&
      end.lng > 0 &&
      end.lat > 0
    ) {
      this.clearPolylines();
      this.initialMarker = {};
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
          this.directionsRenderer.setDirections(result);
          const bound = new google.maps.LatLngBounds();
          bound.extend(start);
          bound.extend(end);
          this.map.googleMap.fitBounds(bound);
          this.updatePolylineWithTraffic(result);
        } else {
        }
      });
    } else {
      this.resetMarkers();
    }
  }

  private updateTruckLocation() {
    if (
      this.truckLocationPosition?.lat &&
      this.truckLocationPosition?.lng &&
      (this.tripStatus != 'Completed' &&
        'Cancelled')
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
        maxWidth: 400
      });

      // Add marker click listener to open InfoWindow and fetch data
      this.truckLocationMarker.addListener('click', () => {
        this.showLoadingSpinner(); // Show loading spinner
        this.fetchTruckData(); // Fetch data from API
        this.startInterval();
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
  fetchTruckData(): void {
    this.truckService.getTrackers(0, 10, this.truckFullRegistrationNumber).subscribe(
      (res: any) => {
        if (res.data?.content?.length > 0) {
          const truckId = res.data.content[0].vehicleId;
          this.truckService.getTrackerData(truckId).subscribe(
            (res: any) => {
                this.truckData = res.data;
                this.updateInfoWindow();
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
          <tr class="grid grid-cols-8 "><td class="col-span-3">Time</td><td>:</td><td class="col-span-4">${this.truckData.time}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Stop Duration<td>:</td></td><td class="col-span-4">${this.truckData.stopDuration}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Engine<td>:</td></td><td class="col-span-4">${this.truckData.engineStatus}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">GSM<td>:</td></td><td class="col-span-4">${this.truckData.gsmValue}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Speed<td>:</td></td><td class="col-span-4">${this.truckData.speed}</td></tr>
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
      this.fetchTruckData();
      this.updateInfoWindow()
    }, 4900);
  }

  private stopInterval() {
    clearInterval(this.intervalData);
  }
}
