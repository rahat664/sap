import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './pages/auth/interceptors/auth.interceptor';
import { DatePipe } from '@angular/common';
import { provideHotToastConfig } from '@ngneat/hot-toast';
import { GeolocationService } from './shared/services/location/geolocation.service';

export function initializeApp(gmapsLoader: GeolocationService): () => Promise<void> {
  return () => gmapsLoader.loadGoogleMapsApi();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHotToastConfig({}),
    DatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [GeolocationService],
      multi: true,
    },
  ],
};
