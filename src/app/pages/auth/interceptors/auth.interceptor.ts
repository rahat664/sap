import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('accessToken');

  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  // Inject dependencies
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Handle 401 Unauthorized error
        authService.logout(); // Clear the local storagege
      }
      return throwError(() => error); // Rethrow the error
    })
  );
};
