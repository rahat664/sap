import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TripService {
  url = `${environment.backendUrl}/api/trips`
  constructor(private http: HttpClient) { }

  getTrips() {
    return this.http.get(this.url);
  }
}
