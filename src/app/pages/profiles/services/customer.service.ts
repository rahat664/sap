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
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import { map } from 'rxjs/operators';
import { CustomerCreateModel, UpdateCustomerModel } from '../components/customer/model/customer-create.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  url = environment.userUrl + '/api/customers';

  constructor(
    private http: HttpClient,
    private toaster: HandleToastrService
  ) {}

  getCustomer(page: number, size: number): Observable<any> {
    const params = { page, size };

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    return this.http.get(`${this.url}?${queryString}`);
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
    phone?: string,
    from?: string,
    to?: string
  ): Observable<any> {
    let apiUrl = `${this.url}?page=${page}&size=${size}`;

    if (from && to) {
      apiUrl += `&from=${from}&to=${to}`;
    }

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

  addCustomerUnderCompany(customerCode, body: any) {
    return this.http.post(`${this.url}/${customerCode}/users`, body, {});
  }

  getCustomerUnderCompany(
    customerCode: any,
    page: any,
    size: any,
    status?: string,
    filter?: string,
    serach?: string
  ) {
    let apiUrl = `${this.url}/${customerCode}/users?page=${page}&size=${size}`;

    if (status) {
      apiUrl += `&status=${status}`;
    }

    if (filter) {
      apiUrl += `&filter=${filter}`;
    }

    if (serach) {
      apiUrl += `&search=${serach}`;
    }

    return this.http.get(apiUrl);
  }

  copyToClipboard(phone: string) {
    const el = document.createElement('textarea');
    el.value = phone;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toaster.showInfo(`${phone} copied to clipboard`);
  }

  getCustomerDetails(customerCode: string): Observable<any> {
    return this.http.get<any>(`${this.url}/customer-code/${customerCode}`)
  }

  editCustomer(customerModel: UpdateCustomerModel) {
    return this.http.put<any>(`${this.url}/update`, customerModel, {});
  }
}
