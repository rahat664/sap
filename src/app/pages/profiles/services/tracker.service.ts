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
  reportUrl = `${environment.locationUrl}/api/vendors/generate-report`;

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

  generateReport(fromDate: string, toDate: string, vehicleIds: string) {
    return this.http.get(`${this.reportUrl}`, {
      params: new HttpParams()
        .set('from', fromDate)
        .set('to', toDate)
        .set('devices', vehicleIds),
    });
  }

  downReport(fromDate: string, toDate: string, vehicleIds: string) {
    return this.http.get(`${this.reportUrl}`, {
      params: new HttpParams()
        .set('from', fromDate)
        .set('to', toDate)
        .set('devices', vehicleIds),
      responseType: 'blob',
    });
  }

  getTrackerData(truckId: any) {
    return this.http.get(`${this.trackerUrl}/sensor-data?deviceId=${truckId}`);
  }

  getEtaData(
    startingLat: number,
    startingLng: number,
    endingLat: number,
    endingLng: Number,
    truckLengthInFeet?: number
  ) {
    if (truckLengthInFeet) {
      return this.http.get(
        `${this.trackerUrl}/eta?startingLat=${startingLat}&startingLng=${startingLng}&endingLat=${endingLat}&endingLng=${endingLng}&truckLengthInFeet=${truckLengthInFeet}`
      );
    } else {
      return this.http.get(
        `${this.trackerUrl}/eta?startingLat=${startingLat}&startingLng=${startingLng}&endingLat=${endingLat}&endingLng=${endingLng}`
      );
    }
  }
}
