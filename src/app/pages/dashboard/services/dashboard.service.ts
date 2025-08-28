import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {shareReplay} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _dashboardUrl = `${environment.backendUrl}/api/v1/dashboard`;
  private _customerStatsUrl = `${environment.userUrl}/api/customers`;
  private _transporterRateAnalysisUrl = `${environment.backendUrl}/api/trips/transporter-rate-stats`;
  private _dateWiseTripCountUrl = `${environment.backendUrl}/api/v1/dashboard/trips-status-count-by-date`;


  constructor(private http: HttpClient) {}

  getApiStats(
    from: string,
    to: string,
    customerCode?: string,
    paymentType?: string,
    tripType?: string,
    truckTypeId?: string,
    transporterCodes?: string
  ) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    if (paymentType) {
      params.set('paymentType', paymentType);
    }
    if (tripType) {
      params.set('tripType', tripType);
    }
    if (truckTypeId) {
      params.set('truckTypeId', truckTypeId);
    }
    if (transporterCodes) {
      params.set('transporterCodes', transporterCodes);
    }
    return this.http.get(
      `${this._dashboardUrl}/statistics?${params.toString()}`
    ).pipe(shareReplay(1));
  }

  getDateWiseTripCount(
    from: string,
    to: string,
    type: string,
    customerCode?: string,
    paymentType?: string,
    tripType?: string,
    truckTypeId?: string,
    transporterCodes?: string
  ) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('type', type);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    if (paymentType) {
      params.set('paymentType', paymentType);
    }
    if (tripType) {
      params.set('tripType', tripType);
    }
    if (truckTypeId) {
      params.set('truckTypeId', truckTypeId);
    }
    if (transporterCodes) {
      params.set('transporterCodes', transporterCodes);
    }
    return this.http.get(`${this._dateWiseTripCountUrl}?${params.toString()}`).pipe(shareReplay(1));
  }

  getCustomerStats(
    from: string,
    to: string,
    customerCode?: string,
    paymentType?: string,
    tripType?: string,
    truckTypeId?: string,
    transporterCodes?: string
  ) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    if (paymentType) {
      params.set('paymentType', paymentType);
    }
    if (tripType) {
      params.set('tripType', tripType);
    }
    if (truckTypeId) {
      params.set('truckTypeId', truckTypeId);
    }
    if (transporterCodes) {
      params.set('transporterCodes', transporterCodes);
    }
    return this.http.get(
      `${this._customerStatsUrl}/stats?${params.toString()}`
    ).pipe(shareReplay(1));
  }

  getChallanStatus(
    from: string,
    to: string,
    customerCode?: string,
    paymentType?: string,
    tripType?: string,
    truckTypeId?: string,
    transporterCodes?: string
  ) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    if (paymentType) {
      params.set('paymentType', paymentType);
    }
    if (tripType) {
      params.set('tripType', tripType);
    }
    if (truckTypeId) {
      params.set('truckTypeId', truckTypeId);
    }
    if (transporterCodes) {
      params.set('transporterCodes', transporterCodes);
    }
    return this.http.get(
      `${this._dashboardUrl}/challan-status?${params.toString()}`
    ).pipe(shareReplay(1));
  }

  getTripCountByStatus(from: string, to: string, customerCode?: string) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    return this.http.get(
      `${this._dashboardUrl}/trips-count-by-status?${params.toString()}`
    ).pipe(shareReplay(1));
  }

  getTopTransporters(
    from: string,
    to: string,
    sortBy: string = 'grossProfit',
    customerCode?: string,
    paymentType?: string,
    tripType?: string,
    truckTypeId?: string,
    transporterCodes?: string
  ) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('sortBy', sortBy);
    params.set('size', '5');
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    if (paymentType) {
      params.set('paymentType', paymentType);
    }
    if (tripType) {
      params.set('tripType', tripType);
    }
    if (truckTypeId) {
      params.set('truckTypeId', truckTypeId);
    }
    if (transporterCodes) {
      params.set('transporterCodes', transporterCodes);
    }
    return this.http.get(
      `${this._dashboardUrl}/top-transporters?${params.toString()}`
    ).pipe(shareReplay(1));
  }

  getTopCustomers(
    from: string,
    to: string,
    sortBy: string = 'grossProfit',
    paymentType?: string,
    tripType?: string,
    truckTypeId?: string,
    transporterCodes?: string
  ) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('sortBy', sortBy);
    params.set('size', '5');
    if (paymentType) {
      params.set('paymentType', paymentType);
    }
    if (tripType) {
      params.set('tripType', tripType);
    }
    if (truckTypeId) {
      params.set('truckTypeId', truckTypeId);
    }
    if (transporterCodes) {
      params.set('transporterCodes', transporterCodes);
    }
    return this.http.get(
      `${this._dashboardUrl}/top-customers?${params.toString()}`
    ).pipe(shareReplay(1));
  }

  getTransporterRateAnalysisData(
    type?: string,
    from?: string,
    to?: string,
    truckType?: string,
    loadingPointDistrictName?: string,
    unloadingPointDistrictName?: string,
    customerCode?: string,
    paymentType?: string,
    tripType?: string,
    tripTypeId?: string,
    transporterCodes?: string
  ) {
    const params = new URLSearchParams();
    if (type) {
      params.set('type', type);
    }
    if (from) {
      params.set('from', from);
    }
    if (to) {
      params.set('to', to);
    }
    if (truckType) {
      params.set('categoryId', truckType);
    }
    if (loadingPointDistrictName) {
      params.set('loadingPointDistrictName', loadingPointDistrictName);
    }
    if (unloadingPointDistrictName) {
      params.set('unloadingPointDistrictName', unloadingPointDistrictName);
    }
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    if (paymentType) {
      params.set('paymentType', paymentType);
    }
    if (tripType) {
      params.set('tripType', tripType);
    }
    if (tripTypeId) {
      params.set('tripTypeId', tripTypeId);
    } if (transporterCodes) {
      params.set('transporterCodes', transporterCodes);
    }

    return this.http.get(
      `${this._transporterRateAnalysisUrl}?${params.toString()}`
    ).pipe(shareReplay(1));
  }
}
