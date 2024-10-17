import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _dashboardUrl = `${environment.backendUrl}/api/v1/dashboard`;
  private _customerStatsUrl = `${environment.userUrl}/api/customers`;

  constructor(private http: HttpClient) {}

  getApiStats(from: string, to: string) {
    return this.http.get(
      `${this._dashboardUrl}/statistics?from=${from}&to=${to}`
    );
  }

  getCustomerStats(from: string, to: string) {
    return this.http.get(
      `${this._customerStatsUrl}/stats?from=${from}&to=${to}`
    );
  }

  getChallanStatus(from: string, to: string) {
    return this.http.get(
      `${this._dashboardUrl}/challan-status?from=${from}&to=${to}`
    );
  }

  getTripCountByStatus(from: string, to: string) {
    return this.http.get(
      `${this._dashboardUrl}/trips-count-by-status?from=${from}&to=${to}`
    );
  }

  getTopTransporters(from: string, to: string) {
    return this.http.get(
      `${this._dashboardUrl}/top-transporters?from=${from}&to=${to}&size=5`
    );
  }

  getTopCustomers(from: string, to: string) {
    return this.http.get(
      `${this._dashboardUrl}/top-customers?from=${from}&to=${to}&size=10`
    );
  }
}
