import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  throwError,
} from 'rxjs';
import { ApiResponse } from '../../auth/models/response/api-response';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  url = `${environment.backendUrl}/api/trips`;
  tripTemplateUrl = `${environment.backendUrl}/api/trip_templates`;
  vehicleTypeUrl = `${environment.backendUrl}/api/vehicle-categories`;
  goodsOptionsUrl = `${environment.backendUrl}/api/goods`;

  constructor(private http: HttpClient) {}

  getTrips(
    page: number,
    size?: number,
    search?: string,
    startDate?: string,
    endDate?: string,
    status?: string,
    tripId?: string
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

    return this.http.get(`${this.url}`, { params });
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

  getTripStatusCounts(): Observable<any> {
    return this.http.get<ApiResponse>(this.url + '/tripStatusCounts').pipe(
      map(response => {
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  getSummary(): Observable<any> {
    return this.http.get<ApiResponse>(this.url + '/summary').pipe(
      map(response => {
        return response.data;
      }),
      catchError(this.handleError)
    );
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
}
