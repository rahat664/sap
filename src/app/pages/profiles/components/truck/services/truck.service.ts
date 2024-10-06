import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TruckService {
  url = `${environment.backendUrl}/api/trucks`;
  preHireChecklistUrl = `${environment.backendUrl}/api/preHireChecklist`;
  checklistUrl = `${environment.backendUrl}/api/checklist`;

  constructor(private http: HttpClient) {}

  getTruckList(page: number, size: number, search?: string): Observable<any> {
    let apiUrl = `${this.url}?page=${page}&size=${size}`;
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    return this.http.get(apiUrl);
  }

  addTruck(truck: any) {
    return this.http.post(this.url, truck);
  }

  getPreHireChecklist(id?: number) {
    if (id) {
      return this.http.get(`${this.preHireChecklistUrl}/${id}`);
    } else {
      return this.http.get(this.checklistUrl);
    }
  }

  editTruck(truck: any) {
    return this.http.put(`${this.url}`, truck);
  }

  deleteTruckFiles(deletedTruckFilesUrl: any, truckId: number) {
    return this.http.delete(
      `${this.url}/${truckId}/documents?documentUrl=${deletedTruckFilesUrl}`
    );
  }

  validateTruckInformation(body) {
    return this.http.post(`${this.url}/checkVehicle`, body);
  }

  getTruckData() {

  }
}
