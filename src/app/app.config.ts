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
import { provideStore } from '@ngrx/store';
import { authReducer } from './pages/auth/ngrx/auth.reducer';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './pages/auth/ngrx/auth.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { metaReducers } from './pages/auth/ngrx/localstorage.metareducer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export function initializeApp(
  gmapsLoader: GeolocationService
): () => Promise<void> {
  return () => gmapsLoader.loadGoogleMapsApi();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(BrowserAnimationsModule),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHotToastConfig({}),
    provideStore({ auth: authReducer }, { metaReducers }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    DatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [GeolocationService],
      multi: true,
    },
  ],
};
