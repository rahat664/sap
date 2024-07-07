import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../auth/models/response/api-response';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  url = environment.userUrl + '/api/customers';

  constructor(private http: HttpClient) {}

  getCustomer() {
    return this.http.get(`${this.url}`);
  }

  addCustomer(body: any) {
    return this.http.post(`${this.url}`, body, {});
  }

  customerCodeValidation(code: any) {
    return this.http.get(`${this.url}/validate-customer-code/${code}`);
  }

  searchCustomer(searchValue?: string, phone?: string) {
    if (searchValue) {
      return this.http
        .get<ApiResponse>(this.url + '?search=' + searchValue)
        .pipe(
          debounceTime(1000),
          distinctUntilChanged(),
          map(response => {
            return response;
          }),
          catchError(this.handleError)
        );
    } else if (phone) {
      return this.http.get<ApiResponse>(this.url + '?phone=' + phone).pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        map(response => {
          return response;
        }),
        catchError(this.handleError)
      );
    } else {
      return this.http.get(`${this.url}`);
    }
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
