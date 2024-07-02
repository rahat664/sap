import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { GeolocationService } from '../../services/location/geolocation.service';

declare var google: any;

@Component({
  selector: 'app-g-map',
  standalone: true,
  imports: [],
  templateUrl: './g-map.component.html',
  styleUrl: './g-map.component.scss',
})
export class GMapComponent implements OnInit, OnChanges {
  lat: number;
  lng: number;
  @Input() starting: string;
  @Input() destination: string;
  map: google.maps.Map;
  marker: google.maps.Marker;
  address: google.maps.InfoWindow;

  constructor(private geoLocationService: GeolocationService) {
    this.geoLocationService.getCurrentPosition().then(coords => {
      this.lat = coords.latitude;
      this.lng = coords.longitude;
      this.initMap();
    });
  }

  ngOnInit(): void {
  }


  private initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: this.lat, lng: this.lng },
      zoom: 8,
      zoomControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      keyboardShortcuts: false,
    });
    this.marker = new google.maps.Marker({
      position: { lat: this.lat, lng: this.lng },
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: 'Drag me!',
    });
    // route drawing
    if (this.starting && this.destination) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(this.map);
      directionsService.route({
        origin: this.starting,
        destination: this.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (response, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['starting'] && changes['destination']) {
      this.initMap();
    }
  }

}
