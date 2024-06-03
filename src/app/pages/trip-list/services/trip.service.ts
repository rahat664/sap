import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {catchError, debounceTime, distinctUntilChanged, map, Observable, throwError} from "rxjs";
import {ApiResponse} from "../../auth/models/response/api-response";

@Injectable({
  providedIn: 'root'
})
export class TripService {
  url = `${environment.backendUrl}/api/trips`

  constructor(private http: HttpClient) {
  }

  getTrips(search?: string, startDate?: string, endDate?: string, status?: string) {
    if (search) {
      return this.http.get(`${this.url}?search=${search}`);
    } else if (startDate && endDate) {
      return this.http.get(`${this.url}?from=${startDate}&to=${endDate}`);
    } else if (status) {
      return this.http.get(`${this.url}?status=${status}`);
    } else if (search && startDate && endDate) {
      return this.http.get(`${this.url}?search=${search}&from=${startDate}&to=${endDate}`);
    } else if (search && status) {
      return this.http.get(`${this.url}?search=${search}&status=${status}`);
    } else if (startDate && endDate && status) {
      return this.http.get(`${this.url}?from=${startDate}&to=${endDate}&status=${status}`);
    } else if (search && startDate && endDate && status) {
      return this.http.get(`${this.url}?search=${search}&from=${startDate}&to=${endDate}&status=${status}`);
    } else {
      return this.http.get(this.url);
    }
  }

  getTripSuggestions(search: string): Observable<any> {
    return this.http.get<ApiResponse>(this.url + '?search=' + search).pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      map((response) => {
        return response.data;
      }),
      catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {

    let message = "";

    if (error.status === 0) {

      message = 'Network connection problem!'
    } else {

      message = error.message;
    }

    return throwError(() => new Error(message));
  }

  getTripStatusCounts(): Observable<any> {
    return this.http.get<ApiResponse>(this.url + '/tripStatusCounts').pipe(map((response) => {
      return response.data;
    }),
    catchError(this.handleError));
  }
}
