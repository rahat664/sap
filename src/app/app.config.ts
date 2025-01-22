import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './pages/auth/interceptors/auth.interceptor';
import {
  CommonModule,
  DatePipe,
  DecimalPipe,
  NgOptimizedImage,
  SlicePipe,
} from '@angular/common';
import { provideHotToastConfig } from '@ngneat/hot-toast';
import { provideStore } from '@ngrx/store';
import { authReducer } from './pages/auth/ngrx/auth.reducer';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './pages/auth/ngrx/auth.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { metaReducers } from './pages/auth/ngrx/localstorage.metareducer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(BrowserAnimationsModule, CommonModule),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHotToastConfig({}),
    provideStore({ auth: authReducer }, { metaReducers }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    DatePipe,
    DecimalPipe,
    NgOptimizedImage,
    CommonModule,
    SlicePipe,
  ],
};
