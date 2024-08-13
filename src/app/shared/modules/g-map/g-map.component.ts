import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { GeolocationService } from '../../services/location/geolocation.service';
import { mapStyles } from '../../models/map-options';
import {
  GoogleMap,
  GoogleMapsModule,
  MapDirectionsService,
} from '@angular/google-maps';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-g-map',
  standalone: true,
  imports: [GoogleMapsModule, GoogleMap, NgIf, NgForOf],
  templateUrl: './g-map.component.html',
  styleUrls: ['./g-map.component.scss'],
})
export class GMapComponent implements OnInit, OnChanges {
  @Input() lat: number;
  @Input() lng: number;
  @Input() starting: google.maps.LatLngLiteral;
  @Input() destination: google.maps.LatLngLiteral;

  // Map and directions options
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

  // Markers and Polyline data
  initialMarker: google.maps.MarkerOptions = {};
  startMarker: google.maps.MarkerOptions = {};
  endMarker: google.maps.MarkerOptions = {};
  polylines: google.maps.PolylineOptions[] = [];

  constructor(
    private geoLocationService: GeolocationService,
    private mapDirectionsService: MapDirectionsService
  ) {}

  ngOnInit(): void {
    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      const location = JSON.parse(currentLocation);
      this.center = { lat: location.lat, lng: location.lng };
      // set up initial marker
      this.initialMarker = {
        position: this.center,
        icon: {
          url: '/assets/images/focus.png',
          scaledSize: new google.maps.Size(30, 30),
        },
        title: 'Current Location',
      };
    } else {
      this.geoLocationService.getCurrentPosition().then(position => {
        this.center = { lat: position.latitude, lng: position.longitude };
        // set up initial marker
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['starting'] || changes['destination']) {
      this.updateRoute();
    }
  }

  private updateRoute() {
    const start = this.starting;
    const end = this.destination;

    if (start && end) {
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
          this.updatePolylineWithTraffic(result);
        } else {
          console.error('Directions request failed due to ', status);
        }
      });
    } else {
      this.clearPolylines();
      this.startMarker = {};
      this.endMarker = {};
    }
  }

  private updatePolylineWithTraffic(
    directionsResult: google.maps.DirectionsResult
  ): void {
    const route = directionsResult.routes[0];

    // Set markers for the start and end points
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

    // Draw polyline with traffic data
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
}
