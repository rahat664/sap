import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _dashboardUrl = `${environment.backendUrl}/api/v1/dashboard`;
  private _customerStatsUrl = `${environment.userUrl}/api/customers`;
  private _transporterRateAnalysisUrl = `${environment.backendUrl}/api/trips/transporter-rate-stats`;

  constructor(private http: HttpClient) {}

  getApiStats(from: string, to: string, customerCode?: string) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    return this.http.get(`${this._dashboardUrl}/statistics?${params.toString()}`);
  }

  getCustomerStats(from: string, to: string, customerCode?: string) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    return this.http.get(`${this._customerStatsUrl}/stats?${params.toString()}`);
  }

  getChallanStatus(from: string, to: string, customerCode?: string) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    return this.http.get(`${this._dashboardUrl}/challan-status?${params.toString()}`);
  }

  getTripCountByStatus(from: string, to: string, customerCode?: string) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (customerCode) {
      params.set('customerCode', customerCode);
    }
    return this.http.get(`${this._dashboardUrl}/trips-count-by-status?${params.toString()}`);
  }

  getTopTransporters(from: string, to: string, sortBy: string = 'grossProfit') {
    return this.http.get(
      `${this._dashboardUrl}/top-transporters?from=${from}&to=${to}&size=5&sortBy=${sortBy}`
    );
  }

  getTopCustomers(from: string, to: string, sortBy: string = 'grossProfit') {
    return this.http.get(
      `${this._dashboardUrl}/top-customers?from=${from}&to=${to}&size=5&sortBy=${sortBy}`
    );
  }

  getTransporterRateAnalysisData(
    type?: string,
    from?: string,
    to?: string,
    transporterCode?: string,
    truckType?: string,
    loadingPointDistrictName?: string,
    unloadingPointDistrictName?: string
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
    if (transporterCode) {
      params.set('transporterCode', transporterCode);
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

    return this.http.get(
      `${this._transporterRateAnalysisUrl}?${params.toString()}`
    );
  }
}
