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
  throwError,
} from 'rxjs';
import { ApiResponse } from '../../auth/models/response/api-response';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  url = `${environment.backendUrl}/api/trips`;
  tripTemplateUrl = `${environment.backendUrl}/api/trip_templates`;
  tripPointUrl = `${environment.backendUrl}/api/tripPointEvents`;
  vehicleTypeUrl = `${environment.backendUrl}/api/vehicle-categories`;
  districtUrl = `${environment.backendUrl}/api/districts`;
  goodsOptionsUrl = `${environment.backendUrl}/api/goods`;
  locationSuggestionsUrl = `${environment.locationUrl}/api/location-notes/search-autocomplete`;
  trackByRegistationUrl = `${environment.locationUrl}/api/locations/filter`;
  cachedTruckSize: BehaviorSubject<any[]> = new BehaviorSubject([]);
  cachedTruckCapacity: BehaviorSubject<any[]> = new BehaviorSubject([]);
  reloadManageTripPage: BehaviorSubject<boolean> = new BehaviorSubject(false);
  bottomHeight: BehaviorSubject<string> = new BehaviorSubject('0px');
  anotherStatusCalled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private toaster: HandleToastrService
  ) {}

  getTrips(
    page: number,
    size?: number,
    search?: string,
    startDate?: string,
    endDate?: string,
    status?: string,
    tripId?: string,
    truckType?: string
  ): Observable<any> {
    let params = new HttpParams().set('page', page.toString());
    if (size) {
      params = params.set('size', size.toString());
    }
    if (search) {
      params = params.set('customerCode', search);
    }
    if (startDate) {
      params = params.set('from', startDate);
    }
    if (endDate) {
      params = params.set('to', endDate);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (tripId) {
      params = params.set('search', tripId);
    }
    if (truckType) {
      params = params.set('truckType', truckType);
    }

    return this.http.get(`${this.url}`, { params });
  }

  getTripDetailsByTripId(tripId: string): Observable<any> {
    return this.http.get(`${this.url}/${tripId}`);
  }

  getTripSuggestions(search: string): Observable<any> {
    return this.http.get<ApiResponse>(this.url + '?search=' + search).pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      map(response => {
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = '';

    if (error.status === 0) {
      message = 'Network connection problem!';
    } else {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }

  getTripTemplate(userId) {
    return this.http.get(`${this.tripTemplateUrl}?customerCode=${userId}`);
  }

  getVehicleTypeList() {
    return this.http.get(`${this.vehicleTypeUrl}`);
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

  getTruckName(truck_id: any) {
    this.getVehicleTypeList().subscribe((res: any) => {
      const truck = res.data.find(truck => truck.id === truck_id);
      return truck ? truck.name : '';
    });
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
}
