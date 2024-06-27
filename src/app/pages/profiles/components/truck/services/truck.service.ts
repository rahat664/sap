import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TruckService {
  url = `${environment.backendUrl}/api/trucks`;
  preHireChecklistUrl = `${environment.backendUrl}/api/preHireChecklist`;
  checklistUrl = `${environment.backendUrl}/api/checklist`;
  constructor(private http: HttpClient) {}

  getTruckList(page: number, search?: string) {
    if (search) {
      return this.http.get(`${this.url}?page=${page}&search=${search}`);
    } else {
      return this.http.get(`${this.url}?page=${page}`);
    }
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
}
