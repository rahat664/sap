import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private apiLoaded = false;
  private httpClient: HttpClient;
  googleMapUrl = `https://maps.googleapis.com/maps/api/place/details/json`;

  constructor(private httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(this.httpBackend);
  }

  getCurrentPosition(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {});
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }

  searchLocation(input: string): Observable<Object> {
    const url = `${environment.placesApiUrl}`;
    const params = {
      input: input,
      includedRegionCodes: ['bd'],
    };
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.API_KEY,
    };

    return this.httpClient.post(url, params, { headers });
  }

  getLatLong(placeId: string) {
    const params = new HttpParams()
      .set('place_id', placeId)
      .set('key', environment.API_KEY)
      .set('fields', 'geometry');
    return this.httpClient.get(this.googleMapUrl, { params });
  }

  loadGoogleMapsApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.apiLoaded) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        this.apiLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
}
