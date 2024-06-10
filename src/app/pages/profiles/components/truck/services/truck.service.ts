import { Injectable } from '@angular/core';
import {environment} from "../../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  url = `${environment.backendUrl}/api/trucks`
  preHireChecklistUrl = `${environment.backendUrl}/api/preHireChecklist`
  checklistUrl = `${environment.backendUrl}/api/checklist`
  constructor(private http:HttpClient) { }

  getTruckList() {
    return this.http.get(this.url);
  }

  addTruck(truck: any) {
    return this.http.post(this.url, truck);
  }

  getPreHireChecklist(id?: number) {
   if (id) {
     return this.http.get(`${this.preHireChecklistUrl}/${id}`)
   } else  {
      return this.http.get(this.checklistUrl)
   }
  }
  editTruck(truck: any) {
    return this.http.put(`${this.url}/${truck.id}`, truck);
  }
}
