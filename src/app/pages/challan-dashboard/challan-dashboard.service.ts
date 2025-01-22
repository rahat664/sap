import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChallanDashboardService {
  private _dashboardUrl = `${environment.backendUrl}/api/v1/dashboard`;
  private _tripUrl = `${environment.backendUrl}/api/trips`;

  constructor(private http: HttpClient) {}
  getChallanStatus(from: string, to: string) {
    return this.http.get(
      `${this._dashboardUrl}/challan-status?from=${from}&to=${to}`
    );
  }

  updateChallanStatus(tripId: string, body: any) {
    return this.http.put(`${this._tripUrl}/${tripId}/challans`, body);
  }
}
