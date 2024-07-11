import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Observable,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  url = environment.userUrl + '/api/customers';

  constructor(private http: HttpClient) {}

  getCustomer(page: number, size: number): Observable<any> {
    const params = { page, size };

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    return this.http.get(`${this.url}/customers?${queryString}`);
  }

  addCustomer(body: any) {
    return this.http.post(`${this.url}`, body, {});
  }

  customerCodeValidation(code: any) {
    return this.http.get(`${this.url}/validate-customer-code/${code}`);
  }

  searchCustomer(
    page: number,
    size: number,
    searchValue?: string,
    phone?: string
  ): Observable<any> {
    let apiUrl = `${this.url}?page=${page}&size=${size}`;

    if (searchValue) {
      apiUrl += `&search=${encodeURIComponent(searchValue)}`;
    } else if (phone) {
      apiUrl += `&phone=${encodeURIComponent(phone)}`;
    }

    return this.http
      .get(apiUrl)
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
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
}
