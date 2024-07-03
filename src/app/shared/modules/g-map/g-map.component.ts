import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { GeolocationService } from '../../services/location/geolocation.service';
import { mapStyles } from '../../models/map-options';
import LatLngLiteral = google.maps.LatLngLiteral;

declare var google: any;


@Component({
  selector: 'app-g-map',
  standalone: true,
  templateUrl: './g-map.component.html',
  styleUrls: ['./g-map.component.scss'],
})
export class GMapComponent implements OnInit, OnChanges {
  private static readonly TRAFFIC_COLORS = {
    HEAVY: '#FF0000',
    MODERATE: '#FFA500',
    LIGHT: '#11484F',
  };

  private static readonly DURATION_THRESHOLDS = {
    HEAVY_TRAFFIC: 1800000, // in milliseconds
    MODERATE_TRAFFIC: 900000, // in milliseconds
  };

  @Input() lat: number;
  @Input() lng: number;
  @Input() starting: LatLngLiteral;
  @Input() destination: LatLngLiteral;
  map: google.maps.Map;
  directionsService: google.maps.DirectionsService;
  directionsRenderer: google.maps.DirectionsRenderer;
  trafficLayer: google.maps.TrafficLayer;
  polylinePaths: google.maps.Polyline[] = [];
  startMarker: google.maps.Marker = new google.maps.Marker();
  endMarker: google.maps.Marker = new google.maps.Marker();
  initialMarker: google.maps.Marker = new google.maps.Marker();

  constructor(private geoLocationService: GeolocationService) {
    this.geoLocationService.getCurrentPosition().then(coords => {
      this.lat = coords.latitude;
      this.lng = coords.longitude;
      this.initMap({ lat: this.lat, lng: this.lng });
    }).catch(error => {
      console.error('Error getting current position', error);
      ``;
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['starting'] || changes['destination']) {
      this.updateRoute();
    }
  }

  private initMap(latLng: { lng: number; lat: number }) {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: latLng,
      zoom: 8,
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      keyboardShortcuts: false,
      disableDefaultUI: true,
    });
    this.setupMapComponents();
    this.updateRoute(latLng);
  }

  private updateRoute(latlng?: { lat: number; lng: number }) {
    const start = this.starting;
    const end = this.destination;

    if (start && end) {
      this.initialMarker.setMap(null);
      const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.OPTIMISTIC,
        },
      };

      this.directionsService?.route(request, (result, status) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(result);
          this.updatePolylineWithTraffic(result);
        } else {
          console.error('Directions request failed due to ', status);
        }
      });
    } else {
      this.clearPolylines();
      this.startMarker.setMap(null);
      this.endMarker.setMap(null);
      this.initialMarker.setPosition(latlng);
      this.initialMarker.setMap(this.map);
    }
  }

  private setupMapComponents(): void {
    this.trafficLayer = new google.maps.TrafficLayer();
    this.trafficLayer.setMap(this.map);

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeOpacity: 0.7,
        strokeWeight: 5,
      },
    });
    this.directionsRenderer.setMap(this.map);
  }

  private updatePolylineWithTraffic(directionsResult: google.maps.DirectionsResult): void {
    const route = directionsResult.routes[0];
    this.clearPolylines();
    route.legs.forEach(leg => {
      leg.steps.forEach((step: any) => {
        const steps = step as google.maps.DirectionsStep;
        this.drawTrafficPolyline(steps);
      });
    });
    this.startMarker?.setPosition(route.legs[0].start_location);
    this.endMarker.setPosition(route.legs[route.legs.length - 1].end_location);
    this.startMarker.setIcon({
      url: '/assets/svg/start.svg',
      scaledSize: new google.maps.Size(30, 30),
      labelOrigin: new google.maps.Point(15, 40),
    });
    this.endMarker.setIcon({
      url: '/assets/svg/end.svg',
      scaledSize: new google.maps.Size(30, 30),
      labelOrigin: new google.maps.Point(15, -8),
    });
    this.startMarker.setAnimation(google.maps.Animation.DROP);
    this.endMarker.setAnimation(google.maps.Animation.DROP);
    this.startMarker.setTitle(route.legs[0].start_address);
    this.endMarker.setTitle(route.legs[route.legs.length - 1].end_address);
    this.startMarker.setMap(this.map);
    this.endMarker.setMap(this.map);
  }


  private drawTrafficPolyline(step: google.maps.DirectionsStep): void {
    const path = step.path;
    const strokeColor = this.getTrafficColor(step.duration?.value);
    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: strokeColor,
      strokeOpacity: 1,
      strokeWeight: 6,
      map: this.map,
      zIndex: 1,
    });
    this.polylinePaths.push(polyline);
  }

  private getTrafficColor(duration: number | undefined): string {
    if (!duration) return GMapComponent.TRAFFIC_COLORS.LIGHT;
    if (duration > GMapComponent.DURATION_THRESHOLDS.HEAVY_TRAFFIC) return GMapComponent.TRAFFIC_COLORS.HEAVY;
    if (duration > GMapComponent.DURATION_THRESHOLDS.MODERATE_TRAFFIC) return GMapComponent.TRAFFIC_COLORS.MODERATE;
    return GMapComponent.TRAFFIC_COLORS.LIGHT;
  }

  private clearPolylines(): void {
    this.polylinePaths.forEach(polyline => polyline.setMap(null));
    this.polylinePaths = [];
  }
}
