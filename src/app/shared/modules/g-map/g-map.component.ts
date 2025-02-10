import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { GeolocationService } from '../../services/location/geolocation.service';
import { mapStyles } from '../../models/map-options';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { TripService } from '../../../pages/trip-list/services/trip.service';
import { TruckData } from '../../models/truck-data.model';
import { TrackerService } from '../../../pages/profiles/services/tracker.service';
import { Subscription, timer } from 'rxjs';
import {
  TripData,
  TripPoint,
} from '../../../pages/manage-trip/model/trip.details.model';

@Component({
  selector: 'app-g-map',
  imports: [GoogleMapsModule, GoogleMap, NgIf, NgForOf],
  templateUrl: './g-map.component.html',
  styleUrls: ['./g-map.component.scss'],
})
export class GMapComponent implements OnInit, OnChanges, OnDestroy {
  @Output() clearInput: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  private subs: Subscription;
  initInterval: any;
  etaData: any;
  private endPoints: google.maps.LatLngLiteral[];
  private lines: google.maps.Polyline[] = [];
  stopPointMarker: google.maps.Marker[] = [];

  get truckId(): string {
    return this._truckId;
  }

  set truckId(value: string) {
    this._truckId = value;
  }

  @Input() tripStatus: string;
  @Input() truckSizeInFeet: number;
  @Input() lat: number;
  @Input() lng: number;
  @Input() starting: google.maps.LatLngLiteral[] = [];
  @Input() destination: google.maps.LatLngLiteral[] = [];
  @Input() truckLocationPosition: google.maps.LatLngLiteral;
  @Input() singleTripData: TripData;

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
  startMarker: google.maps.Marker[] = [];
  endMarker: google.maps.Marker[] = [];
  polylines: google.maps.PolylineOptions[] = [];
  bottomHeight = '0px';
  infoWindow: any;
  truckData: TruckData = {} as TruckData;
  loading: boolean;
  @Input() truckFullRegistrationNumber: string;
  private intervalData: number;
  private _truckId: string;

  constructor(
    private geoLocationService: GeolocationService,
    private trip: TripService,
    private truckService: TrackerService,
    private datePipe: DatePipe
  ) {}

  ngOnDestroy(): void {
    if (this.startMarker) {
      this.startMarker.forEach(marker => {
        marker.setMap(null);
      });
    }
    if (this.endMarker) {
      this.endMarker.forEach(marker => {
        marker.setMap(null);
      });
    }
    this.startMarker = [];
    this.endMarker = [];
    if (this.initInterval) {
      this.stopInterval();
    }
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    if (this.truckLocationMarker) {
      this.truckLocationMarker.setMap(null);
    }
    if (this.subs) {
      this.subs.unsubscribe();
    }
    if (this.stopPointMarker) {
      this.stopPointMarker.forEach(marker => {
        marker.setMap(null);
      });
      this.stopPointMarker = [];
    }

    this.clearPolylines();
    this.directionsRenderer.setMap(null);
    this.trip.bottomHeight.next('0px');
  }

  ngOnInit(): void {
    if (this.startMarker) {
      this.startMarker.forEach(marker => {
        marker.setMap(null);
      });
    }
    if (this.endMarker) {
      this.endMarker.forEach(marker => {
        marker.setMap(null);
      });
    }
    if (this.stopPointMarker) {
      this.stopPointMarker.forEach(marker => {
        marker.setMap(null);
      });
      this.stopPointMarker = [];
    }
    this.startMarker = [];
    this.endMarker = [];
    if (this.initInterval) {
      clearInterval(this.initInterval);
    }
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    this.trip.bottomHeight.subscribe(height => {
      this.bottomHeight = height;
    });

    if (this.starting.length > 0 && this.destination.length > 0) {
      if (this.tripStatus === 'Completed') {
        // 24 hours before trip started at time
        const tripStartedAt = new Date(this.singleTripData?.tripStartedAt);
        const oneDayBeforeTripStartedAt = new Date(
          tripStartedAt.getTime() - 24 * 60 * 60 * 1000
        );

        const tripEndedAt = new Date(this.singleTripData?.tripEndedAt);
        const oneDayAfterTripEndedAt = new Date(
          tripEndedAt.getTime() + 24 * 60 * 60 * 1000
        );
        this.getTripHistory(
          'previous',
          this.datePipe.transform(
            oneDayBeforeTripStartedAt,
            'yyyy-MM-ddTHH:mm:ss'
          ),
          this.singleTripData?.tripStartedAt
        );
        this.getTripHistory(
          'current',
          this.singleTripData?.tripStartedAt,
          this.singleTripData?.tripEndedAt
        );
        this.getTripHistory(
          'next',
          this.singleTripData?.tripEndedAt,
          this.datePipe.transform(oneDayAfterTripEndedAt, 'yyyy-MM-ddTHH:mm:ss')
        );
      } else {
        if (this.lines) {
          this.lines.forEach(line => {
            line.setMap(null);
          });
        }
        this.updateRoute();
      }
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
    if (this.destination.length > 0) {
      this.endPoints = [];
      this.endPoints = this.destination;
    }
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    if (this.stopPointMarker) {
      this.stopPointMarker.forEach(marker => {
        marker.setMap(null);
      });
      this.stopPointMarker = [];
    }

    if (changes) {
      if (this.starting.length > 0 && this.destination.length > 0) {
        if (this.startMarker) {
          this.startMarker.forEach(marker => {
            marker.setMap(null);
          });
        }
        if (this.endMarker) {
          this.endMarker.forEach(marker => {
            marker.setMap(null);
          });
        }
        this.startMarker = [];
        this.endMarker = [];
        this.updateRoute();
      }
    }
    if (changes['truckLocationPosition']) {
      this.updateTruckLocation();
    }
    if (this.tripStatus === 'Completed') {
      // 24 hours before trip started at time
      const tripStartedAt = new Date(this.singleTripData?.tripStartedAt);
      const oneDayBeforeTripStartedAt = new Date(
        tripStartedAt.getTime() - 24 * 60 * 60 * 1000
      );

      const tripEndedAt = new Date(this.singleTripData?.tripEndedAt);
      const oneDayAfterTripEndedAt = new Date(
        tripEndedAt.getTime() + 24 * 60 * 60 * 1000
      );
      this.getTripHistory(
        'previous',
        this.datePipe.transform(
          oneDayBeforeTripStartedAt,
          'yyyy-MM-ddTHH:mm:ss'
        ),
        this.singleTripData?.tripStartedAt
      );
      this.getTripHistory(
        'current',
        this.singleTripData?.tripStartedAt,
        this.singleTripData?.tripEndedAt
      );
      this.getTripHistory(
        'next',
        this.singleTripData?.tripEndedAt,
        this.datePipe.transform(oneDayAfterTripEndedAt, 'yyyy-MM-ddTHH:mm:ss')
      );
    } else {
      if (this.stopPointMarker) {
        this.stopPointMarker.forEach(marker => {
          marker.setMap(null);
        });
        this.stopPointMarker = [];
      }
      if (this.lines) {
        this.lines.forEach(line => {
          line.setMap(null);
        });
        this.lines = [];
      }
      this.updateRoute();
    }
  }

  private updateRoute() {
    let startPoints: google.maps.LatLngLiteral[] = [];
    let endPoints: google.maps.LatLngLiteral[] = [];

    startPoints = this.starting;
    endPoints = this.destination;

    this.clearInput.emit(true);

    this.initialMarker = {};

    this.connectSequentialPoints(startPoints, 'loading', 'main');
    this.connectPoints(
      startPoints[startPoints.length - 1],
      endPoints[0],
      'loading',
      startPoints.length - 1,
      'main'
    );
    this.connectPoints(
      startPoints[startPoints.length - 1],
      endPoints[0],
      'unloading',
      0,
      'main'
    );
    this.connectSequentialPoints(endPoints, 'unloading', 'main');
  }

  private connectSequentialPoints(
    points: google.maps.LatLngLiteral[],
    pointType: string,
    type
  ) {
    for (let i = 0; i < points.length - 1; i++) {
      if (pointType === 'loading') {
        this.connectPoints(points[i], points[i + 1], pointType, i, type);
      } else {
        this.connectPoints(points[i], points[i + 1], pointType, i + 1, type);
      }
    }
  }

  // Connects two points and renders the route
  private connectPoints(
    start: google.maps.LatLngLiteral,
    end: google.maps.LatLngLiteral,
    pointType: string,
    index: number,
    type: string
  ) {
    if (start && end) {
      // clear previous markers and polylines
      this.startMarker = [];
      this.endMarker = [];
      this.clearPolylines();
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
            this.setLoadingMarker(start, index);
          } else if (pointType === 'unloading') {
            this.setUnloadingMarker(end, index);
          }
          const bound = new google.maps.LatLngBounds();
          bound.extend(start);
          bound.extend(end);
          this.map.googleMap.fitBounds(bound);
          if (type === 'main') {
            this.updatePolylineWithTraffic(result);
          } else {
            this.clearPolylines();
          }
        } else {
          console.error('Error fetching directions', status);
        }
      });
    }
  }

  private setLoadingMarker(position: google.maps.LatLngLiteral, index: number) {
    const marker = new google.maps.Marker({
      position: position,
      icon: {
        url: '/assets/svg/start.svg', // Replace with your custom loading marker icon
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Loading Point',
      map: this.map.googleMap,
    });

    if (this.tripStatus === 'Running') {
      marker.addListener('click', () => {
        this.onClickMap({ latLng: position }, index);
      });
    }

    this.startMarker.push(marker);
  }

  private setUnloadingMarker(position: google.maps.LatLngLiteral, index) {
    const marker = new google.maps.Marker({
      position: position,
      icon: {
        url: '/assets/svg/end.svg', // Replace with your custom loading marker icon
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Unloading Point',
      map: this.map.googleMap,
    });

    if (this.tripStatus === 'Running') {
      marker.addListener('click', () => {
        this.onClickUnloading({ latLng: position }, index);
      });
    }

    this.endMarker.push(marker);
  }

  private updateTruckLocation() {
    if (
      this.truckLocationPosition?.lat &&
      this.truckLocationPosition?.lng &&
      this.tripStatus != 'Completed' &&
      'Cancelled'
    ) {
      this.fetchTruckData('direct');
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
        this.fetchTruckData('click'); // Fetch data from API
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
    this.endMarker = [];
    this.startMarker = [];
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
          this.polylines.push({
            path: step.path.map(latlng => latlng.toJSON()),
            strokeColor: '#11484F', // Polyline color
            strokeOpacity: 1,
            strokeWeight: 4,
          });
          // Store the polyline for management
        });
      });
    });
  }

  private clearPolylines(): void {
    this.polylines = [];
    this.starting = [];
    this.destination = [];
  }

  fetchTruckData(useCase: string): void {
    this.subs = this.truckService
      .getTrackers(0, 10, this.truckFullRegistrationNumber)
      .subscribe(
        (res: any) => {
          if (res.data?.content?.length > 0) {
            this._truckId = res.data.content[0].vehicleId;
            this.truckService.getTrackerData(this._truckId).subscribe(
              (res: any) => {
                this.truckData = res.data;
                if (this.tripStatus === 'Running') {
                  this.truckService
                    .getEtaData(
                      this.truckLocationPosition?.lat,
                      this.truckLocationPosition?.lng,
                      this.endPoints[this.endPoints?.length - 1]?.lat,
                      this.endPoints[this.endPoints?.length - 1]?.lng,
                      this.truckSizeInFeet
                    )
                    .subscribe((response: any) => {
                      this.etaData = response.data;
                      this.truckLocationPosition = {
                        lat: res.data?.lat,
                        lng: res.data?.lng,
                      };
                      if (useCase === 'click') {
                        if (this.intervalData) {
                          this.stopInterval();
                        }
                        this.startInterval(useCase);
                        this.updateInfoWindow();
                      }
                      if (this.intervalData) {
                        this.stopInterval();
                      }
                      this.startInterval(useCase);
                    });
                } else {
                  this.truckLocationPosition = {
                    lat: res.data?.lat,
                    lng: res.data?.lng,
                  };
                  if (useCase === 'click') {
                    if (this.intervalData) {
                      this.stopInterval();
                    }
                    this.startInterval(useCase);
                    this.updateInfoWindow();
                  }
                  if (this.intervalData) {
                    this.stopInterval();
                  }
                  this.startInterval(useCase);
                }
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

  updateInfoWindow(): void {
    this.truckLocationMarker.setPosition(this.truckLocationPosition);
    this.infoWindow.setContent(this.getInfoWindowContent());
    this.infoWindow.open(this.map, this.truckLocationMarker);

    // Add event listener for the close button
    timer(100).subscribe(() => {
      const closeBtn = document.getElementById('closeBtn');
      closeBtn.addEventListener('click', () => {
        this.infoWindow.close();
        this.stopInterval();
        this.fetchTruckData('close');
      });
    });
    // Delay to allow the DOM to render
  }

  getInfoWindowContent(): string {
    let dateTimeDisplay = '';
    if (this.tripStatus === 'Running') {
      dateTimeDisplay = this.etaData?.etaDateTime
        ? `ETA${this.endPoints?.length > 1 ? ' (Last unloading point)' : ' '}: ${this.datePipe.transform(this.etaData?.etaDateTime, 'd MMM yyyy, h:mm a')}`
        : `<span class="text-red">No eta data available</span>`;
    }
    return `
      <div style="display: flex; justify-content: space-between; align-items: start; padding:  1rem;">
        <div class="flex flex-col space-y-1">
          <div style="font-weight: 500; font-size: 14px; line-height: 20px">${this.truckData.numberPlate}</div>
          <div style="font-size: 12px; color: #777777">${this.truckData.address}</div>
        </div>
        <button id="closeBtn" style="background: transparent; border: none; cursor: pointer;">
          <i class="far fa-times cursor-pointer"></i>
        </button>
      </div>
      ${
        this.etaData && this.tripStatus === 'Running'
          ? `<div id="info-body" style="background: #F5FBFC; padding: 0.5rem; margin-right: .75rem; padding-bottom: 0; font-size: 12px; color: #242424">
      <p class="text-body_title text-not-black font-bold">${dateTimeDisplay}</p>
       </div>`
          : ''
      }
      <div  id="info-body" style="background: #F5FBFC; padding: 0.5rem; margin-right: .75rem; margin-bottom: .75rem;  font-size: 12px; color: #242424">
        <table id="info-table" style="width: 100%; margin-right: 0.5rem">
          <tr class="grid grid-cols-8 "><td class="col-span-3">Time</td><td>:</td><td class="col-span-4">${this.truckData.time ? this.truckData.time : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Stop Duration<td>:</td></td><td class="col-span-4">${this.truckData.stopDuration ? this.truckData.stopDuration : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Engine Status<td>:</td></td><td class="col-span-4">${this.truckData.engineStatus ? this.truckData.engineStatus : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">GSM<td>:</td></td><td class="col-span-4">${this.truckData.gsmValue ? this.truckData.gsmValue : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Speed<td>:</td></td><td class="col-span-4">${this.truckData.speed ? this.truckData.speed : 'N/A'} ${this.truckData.speed ? 'km/h' : ''}</td></tr>
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

  private startInterval(useCase: string) {
    this.intervalData = setInterval(() => {
      this.updateTruckDataOnly(useCase);
    }, 3900);
  }

  private stopInterval() {
    clearInterval(this.intervalData);
    this.subs.unsubscribe();
  }

  private updateTruckDataOnly(useCase: string) {
    this.subs = this.truckService.getTrackerData(this._truckId).subscribe(
      (res: any) => {
        this.truckData = res.data;
        this.truckLocationPosition = {
          lat: res.data?.lat,
          lng: res.data?.lng,
        };
        this.stopInterval();
        this.startInterval(useCase);
        if (useCase === 'click') {
          this.updateInfoWindow();
        }
      },
      error => {}
    );
  }

  onClickMap($event: any, index: number): void {
    this.stopInterval();
    this.startInterval('eta');
    this.handleInfoWindow(
      $event.latLng,
      index,
      this.truckLocationPosition &&
        this.truckLocationPosition?.lat &&
        this.truckLocationPosition?.lng &&
        this.tripStatus === 'Running'
        ? this.getEtaData.bind(this)
        : null,
      this.getNoTruckerAvailableContent.bind(this)
    );
  }

  onClickUnloading($event: any, index: number): void {
    this.stopInterval();
    this.startInterval('eta');
    this.handleInfoWindow(
      $event.latLng,
      index,
      this.truckLocationPosition &&
        this.truckLocationPosition?.lat &&
        this.truckLocationPosition?.lng &&
        this.tripStatus === 'Running'
        ? this.getUnloadingEtaData.bind(this)
        : null,
      this.getNoTruckerAvailableContentUnloading.bind(this)
    );
  }

  // Generalized info window handler
  private handleInfoWindow(
    latLng: google.maps.LatLng | null,
    index: number,
    fetchDataCallback:
      | ((latLngLiteral: google.maps.LatLng, index: number) => void)
      | null,
    noDataCallback: (index: number) => string
  ): void {
    if (this.infoWindow) {
      this.infoWindow.close();
      this.subs.unsubscribe();
    }

    if (fetchDataCallback && latLng) {
      this.infoWindow = this.createInfoWindow(this.getLoadingSpinnerContent());
      this.infoWindow.setPosition(latLng);
      this.infoWindow.open(this.map.googleMap);
      fetchDataCallback(latLng, index);
    } else {
      this.infoWindow = this.createInfoWindow(noDataCallback(index));
      this.infoWindow.setPosition(latLng);
      this.infoWindow.open(this.map.googleMap);
    }
  }

  // Creates an info window with given content
  private createInfoWindow(content: string): google.maps.InfoWindow {
    return new google.maps.InfoWindow({ content });
  }

  // Fetch ETA data
  private getEtaData(
    destination: google.maps.LatLngLiteral,
    index: number
  ): void {
    if (this.tripStatus === 'Running') {
      this.stopInterval();
      this.startInterval('eta');
      this.fetchEtaData(
        destination,
        index,
        this.getEtaContent.bind(this),
        this.getEtaErrorContent.bind(this)
      );
    }
  }

  private getUnloadingEtaData(
    destination: google.maps.LatLngLiteral,
    index: number
  ): void {
    if (this.tripStatus === 'Running') {
      this.stopInterval();
      this.startInterval('eta');
      this.fetchEtaData(
        destination,
        index,
        this.getUnloadingEtaContent.bind(this),
        this.getUnloadingEtaErrorContent.bind(this)
      );
    }
  }

  // Generalized ETA data fetcher
  private fetchEtaData(
    destination: google.maps.LatLngLiteral,
    index: number,
    successCallback: (data: any, index: number) => string,
    errorCallback: (index: number) => string
  ): void {
    this.truckService
      .getEtaData(
        this.truckLocationPosition?.lat,
        this.truckLocationPosition?.lng,
        destination.lat,
        destination.lng,
        this.truckSizeInFeet
      )
      .subscribe(
        (res: any) => {
          this.infoWindow.setContent(successCallback(res.data, index));
        },
        () => this.infoWindow.setContent(errorCallback(index))
      );
  }

  // Generate content with close button
  private generateContent(content: string): string {
    timer(100).subscribe(() => this.attachCloseButton());
    return content;
  }

  private attachCloseButton(): void {
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.infoWindow.close();
        this.stopInterval();
        this.fetchTruckData('close');
      });
    }
  }

  // Info window content generation
  private getEtaContent(data: any, index: number): string {
    return this.generateContent(
      this.createInfoWindowHtml(data?.etaDateTime, index, 'ETA', 'Loading')
    );
  }

  private getEtaErrorContent(index: number): string {
    return this.generateContent(
      this.createInfoWindowHtml(null, index, 'Failed to get ETA', 'Loading')
    );
  }

  private getNoTruckerAvailableContent(index: number): string {
    return this.generateContent(
      this.createInfoWindowHtml(
        null,
        index,
        'No Eta data is available for this trip or this is not a running trip',
        'Loading'
      )
    );
  }

  private getUnloadingEtaContent(data: any, index: number): string {
    return this.generateContent(
      this.createInfoWindowHtml(data?.etaDateTime, index, 'ETA', 'Unloading')
    );
  }

  private getUnloadingEtaErrorContent(index: number): string {
    return this.generateContent(
      this.createInfoWindowHtml(null, index, 'Failed to get ETA', 'Unloading')
    );
  }

  private getNoTruckerAvailableContentUnloading(index: number): string {
    return this.generateContent(
      this.createInfoWindowHtml(
        null,
        index,
        'No Tracker is available for this trip',
        'Unloading'
      )
    );
  }

  // Creates the HTML for the info window
  private createInfoWindowHtml(
    etaDateTime: string | null,
    index: number,
    message: string,
    type: string
  ): string {
    const address =
      etaDateTime && type === 'Loading'
        ? this.getTripLoadingAddress(this.singleTripData?.tripPoints, index)
        : this.getTripUnloadingAddress(this.singleTripData?.tripPoints, index);

    const dateTimeDisplay = etaDateTime
      ? `ETA: ${this.datePipe.transform(etaDateTime, 'd MMM yyyy, h:mm a')}`
      : `<span class="text-red">${message}</span>`;

    return `
    <div style="display: flex; justify-content: space-between; min-width: 20rem; align-items: start; padding: 1rem 0;">
      <div class="flex flex-col space-y-1">
        <div style="font-weight: 500; font-size: 14px; line-height: 20px">${this.singleTripData?.truck?.fullRegistrationNumber ? this.singleTripData?.truck?.fullRegistrationNumber : 'Truck Not Assigned'}</div>
        <div style="font-size: 12px; color: #777777">${address}</div>
      </div>
      <button id="closeBtn" style="background: transparent; border: none; cursor: pointer;">
        <i class="far fa-times cursor-pointer"></i>
      </button>
    </div>
    <div id="info-body" style="background: #F5FBFC; padding: 0.5rem; font-size: 12px; color: #242424">
      <p class="text-body_title text-not-black font-bold">${dateTimeDisplay}</p>
    </div>
  `;
  }

  // Address helpers
  @Input() trackerEnabled!: boolean;

  private getTripLoadingAddress(
    tripPoints: TripPoint[] | undefined,
    index: number
  ): string {
    return this.getTripAddress(tripPoints, 'Loading', index);
  }

  private getTripUnloadingAddress(
    tripPoints: TripPoint[] | undefined,
    index: number
  ): string {
    return this.getTripAddress(tripPoints, 'Unloading', index);
  }

  private getTripAddress(
    tripPoints: TripPoint[] | undefined,
    pointType: string,
    index: number
  ): string {
    if (tripPoints && tripPoints.length > 0) {
      const filteredPoints = tripPoints.filter(
        point => point.pointType === pointType
      );
      return filteredPoints[index]?.pointName || 'No address found';
    }
    return 'No address found';
  }

  private connectHistoryRoute(data, type) {
    for (let i = 0; i < data?.length; i = i + 10) {
      this.artStopMarker(
        i + 10 < data?.length ? data[i + 10] : data[data.length - 1],
        data[i]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const startLat = data[i].latitude;
      const startLng = data[i].longitude;
      const endLat = data[i + 1]?.latitude;
      const endLng = data[i + 1]?.longitude;
      const start = { lat: startLat, lng: startLng };
      const end = { lat: endLat, lng: endLng };
      if (type === 'previous') {
        this.connect24HoursBeforeHistoryRoute(start, end);
      } else if (type === 'current') {
        this.connectHistoryPoint(start, end);
      } else if (type === 'next') {
        this.connect24HoursAfterHistoryRoute(start, end);
      }
    }
  }

  private connectHistoryPoint(start, end: any) {
    if (start && end) {
      // const arrowSymbol = {
      //   path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW, // Arrow symbol
      //   scale: 2, // Size of the arrow
      //   strokeColor: "#11484F", // Arrow color
      //   strokeWeight: 2, // Arrow weight
      // };
      const lineCoordinates = [start, end];
      const line = new google.maps.Polyline({
        path: lineCoordinates,
        geodesic: true,
        strokeOpacity: 1,
        strokeColor: '#11484F',
        strokeWeight: 4,
        // icons: [
        //   {
        //     icon: arrowSymbol,
        //     offset: '100%',
        //   },
        // ],
      });
      line.setMap(this.map.googleMap);
      this.lines.push(line);
    }
  }

  getTripHistory(type, from, to) {
    let startPoints = [];
    let endPoints = [];

    if (this.destination.length > 0 && this.starting.length > 0) {
      startPoints = this.starting;
      endPoints = this.destination;
    }
    this.trip
      .getTripHistory(
        from,
        to,
        this.singleTripData?.truck?.fullRegistrationNumber
      )
      .subscribe(
        (res: any) => {
          this.clearInput.emit(true);
    startPoints = this.starting;
    endPoints = this.destination;
    this.endPoints = this.destination;
    if (this.endPoints.length > 0 && from && to) {
      this.trip
        .getTripHistory(
          from,
          to,
          this.singleTripData?.truck?.fullRegistrationNumber
        )
        .subscribe(
          (res: any) => {
            this.clearInput.emit(true);

            this.initialMarker = {};

            this.connectSequentialPoints(
              startPoints,
              'loading',
              res.data?.length > 0 ? 'history' : 'main'
            );
            this.connectPoints(
              startPoints[startPoints.length - 1],
              endPoints[0],
              'loading',
              startPoints.length - 1,
              res.data?.length > 0 ? 'history' : 'main'
            );
            this.connectPoints(
              startPoints[startPoints.length - 1],
              endPoints[0],
              'unloading',
              0,
              res.data?.length > 0 ? 'history' : 'main'
            );
            this.connectSequentialPoints(
              endPoints,
              'unloading',
              res.data?.length > 0 ? 'history' : 'main'
            );
            if (res.data?.length > 0) {
              this.connectHistoryRoute(res.data, type);
            } else {
              if (this.lines) {
                this.lines.forEach(line => {
                  line.setMap(null);
                });
              }
            }
          },
          error => {
            if (this.lines) {
              this.lines.forEach(line => {
                line.setMap(null);
              });
            }
            this.connectSequentialPoints(startPoints, 'loading', 'main');
            this.connectPoints(
              startPoints[startPoints.length - 1],
              endPoints[0],
              'loading',
              startPoints.length - 1,
              'main'
            );
            this.connectPoints(
              startPoints[startPoints.length - 1],
              endPoints[0],
              'unloading',
              0,
              'main'
            );
            this.connectSequentialPoints(endPoints, 'unloading', 'main');
          }
        );
    }
  }

  private connect24HoursBeforeHistoryRoute(start, end: any) {
    const dottedSymbol = {
      path: google.maps.SymbolPath.CIRCLE, // Use a circle to create dots
      scale: 2, // Size of the dots
      strokeOpacity: 1, // Opacity of the dots
      strokeColor: '#A5B8BB', // Color of the dots
    };

    const lineCoordinates = [start, end];
    const line = new google.maps.Polyline({
      path: lineCoordinates,
      geodesic: true,
      strokeOpacity: 0,
      icons: [
        {
          icon: dottedSymbol,
          offset: '0',
          repeat: '10px',
        },
      ],
    });
    line.setMap(this.map.googleMap);
    this.lines.push(line);
  }

  private connect24HoursAfterHistoryRoute(start, end: any) {
    const dottedSymbol = {
      path: google.maps.SymbolPath.CIRCLE, // Use a circle to create dots
      scale: 2, // Size of the dots
      strokeOpacity: 1, // Opacity of the dots
      strokeColor: '#A5B8BB', // Color of the dots
    };

    const lineCoordinates = [start, end];
    const line = new google.maps.Polyline({
      path: lineCoordinates,
      geodesic: true,
      strokeOpacity: 0,
      icons: [
        {
          icon: dottedSymbol,
          offset: '0',
          repeat: '10px',
        },
      ],
    });
    line.setMap(this.map.googleMap);
    this.lines.push(line);

    // draw stop point
  }

  private drawStopPointAndDirection(start, end: any) {}

  private artStopMarker(starts: any, destination: any) {
    const start = starts?.latitude;
    const end = starts?.longitude;
    const destinationStart = destination?.latitude;
    const destinationEnd = destination?.longitude;
    const bearing =
      starts.bearing > 0
        ? starts.bearing
        : this.calculateBearing(destinationStart, destinationEnd, start, end);

    // draw stop point by svg
    // Function to create a rotated icon

    const stopIcon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 4,
      fillColor: '#11484F',
      fillOpacity: 1,
      strokeWeight: 0,
      rotation: bearing,
      anchor: new google.maps.Point(0, 2),
    };

    const marker = new google.maps.Marker({
      position: { lat: destinationStart, lng: destinationEnd },
      icon: stopIcon,
      title: 'Stop Point',
      map: this.map.googleMap,
    });

    this.stopPointMarker.push(marker);

    this.infoWindow = new google.maps.InfoWindow({
      content: '',
      maxWidth: 400,
    });

    marker.setIcon(stopIcon);

    marker.addListener('click', () => {
      if (this.infoWindow) {
        this.infoWindow.close();
      }

      this.infoWindow = new google.maps.InfoWindow({
        content: '',
        maxWidth: 400,
        minWidth: 400,
      });

      this.infoWindow.setContent(this.getStopPointContent(destination));
      this.infoWindow.open(this.map.googleMap, marker);
      this.map.googleMap.setCenter(marker.getPosition());
    });
  }

  private calculateBearing(
    start: any,
    end: any,
    destinationStart: any,
    destinationEnd: any
  ) {
    const startLat = this.toRadians(start);
    const startLng = this.toRadians(end);
    const destinationLat = this.toRadians(destinationStart);
    const destinationLng = this.toRadians(destinationEnd);

    const y = Math.sin(destinationLng - startLng) * Math.cos(destinationLat);
    const x =
      Math.cos(startLat) * Math.sin(destinationLat) -
      Math.sin(startLat) *
        Math.cos(destinationLat) *
        Math.cos(destinationLng - startLng);
    const bearing = Math.atan2(y, x);
    return this.toDegrees(bearing);
  }

  private toDegrees(bearing: number) {
    return (bearing * 180) / Math.PI;
  }

  private toRadians(start: any) {
    return (start * Math.PI) / 180;
  }

  private getStopPointContent(data) {
    timer(100).subscribe(() => {
      const closeBtn = document.getElementById('closeBtn');
      closeBtn.addEventListener('click', () => {
        this.infoWindow.close();
      });
    });
    let time = '';

    if (data?.createdAt) {
      time = this.datePipe.transform(data?.createdAt, 'd MMM yyyy, h:mm a');
    } else {
      time = 'N/A';
    }

    return `
      <div style="display: flex; justify-content: space-between; align-items: start; padding: 1rem 0;">
        <div class="flex flex-col space-y-1">
          <div style="font-weight: 500; font-size: 14px; line-height: 20px">${this.truckFullRegistrationNumber}</div>
          <div style="font-size: 12px; color: #777777">${data?.address ? data?.address : 'Unknown location'}</div>
        </div>
        <button id="closeBtn" style="background: transparent; border: none; cursor: pointer;">
          <i class="far fa-times cursor-pointer"></i>
        </button>
      </div>
      <div  id="info-body" style="background: #F5FBFC; padding: 0.5rem; font-size: 12px; color: #242424">
        <table id="info-table" style="width: 100%;">
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Time<td>:</td></td><td class="col-span-4">${time}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Stop Duration<td>:</td></td><td class="col-span-4">${data?.stopDuration ? data?.stopDuration : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Engine Status<td>:</td></td><td class="col-span-4">${data?.engineStatus ? data?.engineStatus : 'N/A'}</td></tr>
        <tr  class="grid grid-cols-8 "><td class="col-span-3">Speed<td>:</td></td><td class="col-span-4">${data?.speed ? data?.speed : 'N/A'} ${data?.speed ? 'km/h' : ''}</td></tr>
        </table>
      </div>
    `;
  }
}
