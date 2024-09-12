import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private scriptLoaded = false;
  private apiLoaded = false;
  private httpClient: HttpClient;
  googleMapUrl = `https://places.googleapis.com/v1/places`;
  setSidebarClosed: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  constructor(private httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(this.httpBackend);
  }

  getCurrentPosition(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position.coords);
        });
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }

  getLatLong(placeId: string) {
    const params = new HttpParams()
      .set('key', environment.API_KEY)
      .set('fields', 'location');
    return this.httpClient.get(`${this.googleMapUrl}/${placeId}`, { params });
  }

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.API_KEY}`;
      script.defer = true;
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject('Failed to load Google Maps API script');
      };
      document.body.appendChild(script);
    });
  }
}
