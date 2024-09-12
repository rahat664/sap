import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TrackerRequestModel } from '../components/driver/models/tracker-request.model';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  trackerUrl = `${environment.locationUrl}/api/tracker`;
  vendorUrl = `${environment.locationUrl}/api/vendors`;

  constructor(private http: HttpClient) {}

  getTrackers(page: number, size: number, search?: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) {
      params = params.set('vehicleRegistrationNumber', search);
    }
    return this.http.get(`${this.trackerUrl}`, { params });
  }

  getVendors() {
    return this.http.get(`${this.vendorUrl}`);
  }

  addTracker(trackAddModel: TrackerRequestModel) {
    return this.http.post(`${this.trackerUrl}`, trackAddModel);
  }

  updateTracker(
    selectedTrackerId: number,
    body: { vehicleRegistrationNumber: any }
  ) {
    return this.http.put(`${this.trackerUrl}/${selectedTrackerId}`, body);
  }
}
