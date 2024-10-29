import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChallanDashboardService {

  private _dashboardUrl = `${environment.backendUrl}/api/v1/dashboard`;

  constructor(private http: HttpClient) { }
  getChallanStatus(from: string, to: string) {
    return this.http.get(
      `${this._dashboardUrl}/challan-status?from=${from}&to=${to}`
    );
  }
}
