import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { ApiResponse } from '../../auth/models/response/api-response';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private vehicleTypeCache: BehaviorSubject<any[]> = new BehaviorSubject([]);

  url = `${environment.backendUrl}/api/trips`;
  tripTemplateUrl = `${environment.backendUrl}/api/trip_templates`;
  tripPointUrl = `${environment.backendUrl}/api/tripPointEvents`;
  vehicleTypeUrl = `${environment.backendUrl}/api/vehicle-categories`;
  districtUrl = `${environment.backendUrl}/api/districts`;
  goodsOptionsUrl = `${environment.backendUrl}/api/goods`;
  locationSuggestionsUrl = `${environment.locationUrl}/api/location-notes/search-autocomplete`;
  trackByRegistationUrl = `${environment.locationUrl}/api/locations/filter`;
  tripPointEventsUrl = `${environment.backendUrl}/api/tripPointEvents`;
  tripPointDeleteUrl = `${environment.backendUrl}/api/tripPoints`;
  cachedTruckSize: BehaviorSubject<any[]> = new BehaviorSubject([]);
  cachedTruckCapacity: BehaviorSubject<any[]> = new BehaviorSubject([]);
  reloadManageTripPage: BehaviorSubject<boolean> = new BehaviorSubject(false);
  bottomHeight: BehaviorSubject<string> = new BehaviorSubject('0px');
  anotherStatusCalled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private toaster: HandleToastrService
  ) {}

  getTrips(params: {
    page: number;
    size?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    tripId?: string;
    truckType?: string;
    onlyTripId?: string;
    chalanStatus?: string;
    challanHardCopyReceived?: boolean;
    challanFrom?: string;
    challanTo?: string;
    truckRegId?: string;
    transporterNameOrPhone?: string;
  }): Observable<any> {
    let httpParams = new HttpParams().set('page', params.page.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        httpParams = httpParams.set(key, value.toString());
      }
    }
    return this.http.get(this.url, { params: httpParams });
  }


  getTripDetailsByTripId(tripId: string): Observable<any> {
    return this.http.get(`${this.url}/${tripId}`);
  }

  getTripSuggestions(search: string): Observable<any> {
    return this.http.get<ApiResponse>(`${this.url}?search=${search}`).pipe(
      debounceTime(300),  // Adjust debounce time to optimize user experience
      distinctUntilChanged(),
      map(response => response.data),
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) {
      message = 'Network connection problem!';
    } else if (error.status === 404) {
      message = 'Requested resource not found!';
    } else if (error.status === 500) {
      message = 'Internal server error occurred.';
    } else {
      message = error.message || message;
    }
    this.toaster.showError(message);
    return throwError(() => new Error(message));
  }


  getTripTemplate(userId) {
    return this.http.get(`${this.tripTemplateUrl}?customerCode=${userId}`);
  }

  getVehicleTypeList() {
    if (this.vehicleTypeCache.value.length) {
      return of(this.vehicleTypeCache.value);  // Return cached data
    }
    return this.http.get(`${this.vehicleTypeUrl}`).pipe(
      tap((data: any) => this.vehicleTypeCache.next(data)),
      catchError(this.handleError)
    );
  }

  getGoodsOptions() {
    return this.http.get(`${this.goodsOptionsUrl}`);
  }

  getLocationSuggestions(
    address: string,
    companyId: string,
    includeOnlyGoogleMap?: boolean
  ) {
    const params = new HttpParams()
      .set('address', address)
      .set('companyId', companyId)
      .set('includeOnlyGoogleMap', includeOnlyGoogleMap ? 'true' : 'false');
    return this.http.get(this.locationSuggestionsUrl, { params });
  }

  getTruckName(truck_id: any): Observable<string> {
    return this.getVehicleTypeList().pipe(
      map((res: any) => {
        const truck = res.data.find((truck) => truck.id === truck_id);
        return truck ? truck.name : '';
      })
    );
  }


  createTrip(tripData: any) {
    return this.http.post(this.url, tripData);
  }

  postTripTemplate(templateData) {
    return this.http.post(this.tripTemplateUrl, templateData);
  }

  getAllTripEvent(tripId: string, pointType: string) {
    return this.http.get(`${this.tripPointUrl}/${tripId}/${pointType}`);
  }

  updateTrip(body: any, tripId: string) {
    return this.http.put(`${this.url}/${tripId}`, body);
  }

  getDistricts() {
    return this.http.get(`${this.districtUrl}`);
  }

  getTrackerDetails(registrationNumber: string) {
    return this.http.get(
      `${this.trackByRegistationUrl}?registrationNum=${registrationNumber}`
    );
  }

  deleteTemplate(templateId: string) {
    return this.http.delete(`${this.tripTemplateUrl}/${templateId}`);
  }

  updateTemplate(templateId: string, templateData: any) {
    return this.http.put(`${this.tripTemplateUrl}/${templateId}`, templateData);
  }

  copyToClipboard(createdByPhone: string) {
    const el = document.createElement('textarea');
    el.value = createdByPhone;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toaster.showInfo(`${createdByPhone} copied to clipboard`);
  }

  getSensorData(vehicleRegNum?: string) {
    return this.http.get(`${environment.locationUrl}/api/tracker/sensor-data?vehicleRegNum=${vehicleRegNum}`);
  }

  manageLoadingUnloading(body: any): Observable<any> {
    return this.http.post(`${this.tripPointEventsUrl}`, body);
  }

  deleteTripDocument(tripPointId: string, tripPointEventId: string, documentId: string): Observable<any> {
    return this.http.delete(`${this.tripPointDeleteUrl}/${tripPointId}/eventTypes/${tripPointEventId}/documents/${documentId}`);
  }



}
