import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {provideToastr} from "ngx-toastr";
import {provideAnimations} from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {authInterceptor} from "./pages/auth/interceptors/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}), provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor])), provideToastr({
    positionClass: 'toast-top-right',
    preventDuplicates: true,
    timeOut: 2000
  }),
  provideAnimations(), provideAnimationsAsync(),
  ]
};
