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
  reportUrl = `${environment.backendUrl}/api/trip/report`;

  locationSuggestionsUrl = `${environment.locationUrl}/api/location-notes/search-autocomplete`;
  trackByRegistationUrl = `${environment.locationUrl}/api/locations/filter`;
  tripPointEventsUrl = `${environment.backendUrl}/api/tripPointEvents`;
  tripPointDeleteUrl = `${environment.backendUrl}/api/tripPoints`;
  cachedTruckSize: BehaviorSubject<any[]> = new BehaviorSubject([]);
  cachedTruckCapacity: BehaviorSubject<any[]> = new BehaviorSubject([]);
  reloadManageTripPage: BehaviorSubject<boolean> = new BehaviorSubject(false);
  bottomHeight: BehaviorSubject<string> = new BehaviorSubject('0px');
  anotherStatusCalled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  historyApi = `${environment.locationUrl}/api/locations/histories`;

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
    truckType?: string,
    onlyTripId?: string,
    chalanStatus?: string,
    challanHardCopyReceived?: boolean,
    challanFrom?: string,
    challanTo?: string,
    truckRegId?: string,
    transporterNameOrPhone?: string,
    paymentType?: string
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
    if (onlyTripId) {
      params = params.set('tripId', onlyTripId);
    }
    if (chalanStatus) {
      params = params.set('chalanStatus', chalanStatus);
    }
    if (challanHardCopyReceived) {
      params = params.set(
        'challanHardCopyReceived',
        challanHardCopyReceived.toString()
      );
    }
    if (challanFrom) {
      params = params.set('challanFrom', challanFrom);
    }
    if (challanTo) {
      params = params.set('challanTo', challanTo);
    }
    if (truckRegId) {
      params = params.set('truckRegId', truckRegId);
    }
    if (transporterNameOrPhone) {
      params = params.set('transporterNameOrPhone', transporterNameOrPhone);
    }
    if (paymentType) {
      params = params.set('paymentType', paymentType);
    }

    return this.http.get(`${this.url}`, { params });
  }

  getTripDetailsByTripId(tripId: string): Observable<any> {
    return this.http.get(`${this.url}/${tripId}`);
  }

  getTripSuggestions(tripId: string): Observable<any> {
    return this.http.get<ApiResponse>(`${this.url}?tripId=${tripId}`).pipe(
      debounceTime(1000), // Adjust debounce time to optimize user experience
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
      return of(this.vehicleTypeCache.value); // Return cached data
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
        const truck = res.data.find(truck => truck.id === truck_id);
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
    return this.http.get(
      `${environment.locationUrl}/api/tracker/sensor-data?vehicleRegNum=${vehicleRegNum}`
    );
  }

  manageLoadingUnloading(body: any): Observable<any> {
    return this.http.post(`${this.tripPointEventsUrl}`, body);
  }

  deleteTripDocument(
    tripPointId: string,
    tripPointEventId: string,
    documentId: string
  ): Observable<any> {
    return this.http.delete(
      `${this.tripPointDeleteUrl}/${tripPointId}/eventTypes/${tripPointEventId}/documents/${documentId}`
    );
  }

  getTripHistory(from: any, to: any, vehicleRegId: any) {
    return this.http.get(
      `${this.historyApi}?from=${from}&to=${to}&vehicleRegId=${vehicleRegId}`
    );
  }

  getTripReport(params?: any) {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get(`${this.reportUrl}`, { params: httpParams, responseType: 'blob' });
  }
}
