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

  constructor(
    private geoLocationService: GeolocationService,
    private trip: TripService
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['starting'] || changes['destination']) {
      this.updateRoute();
    }
    if (changes['truckLocationPosition']) {
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
    if (this.truckLocationPosition) {
      if (this.truckLocationMarker) {
        // Update existing marker position
        this.truckLocationMarker.setPosition(this.truckLocationPosition);
      } else {
        // Create and add marker to the map
        this.truckLocationMarker = new google.maps.Marker({
          position: this.truckLocationPosition,
          icon: {
            url: '/assets/svg/trucking.svg',
            scaledSize: new google.maps.Size(30, 30),
          },
          title: 'Truck Location',
          map: this.map.googleMap, // Add marker to the map
        });
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
