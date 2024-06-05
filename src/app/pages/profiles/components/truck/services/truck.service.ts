import { Injectable } from '@angular/core';
import {environment} from "../../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  url = `${environment.backendUrl}/api/trucks`
  preHireChecklistUrl = `${environment.backendUrl}/api/preHireChecklist`
  constructor(private http:HttpClient) { }

  getTruckList() {
    return this.http.get(this.url);
  }

  getPreHireChecklist(id: number) {
    return this.http.get(`${this.preHireChecklistUrl}/${id}`);
  }
}
