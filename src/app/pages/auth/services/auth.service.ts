// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/response/api-response';
import { LoginRequest } from '../models/request/login-request';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(payload: LoginRequest): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(environment.userUrl + '/auth/login', payload)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = '';

    if (error.status === 0) {
      message = 'Network connection problem!';
    } else {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn() {
    return localStorage.getItem('accessToken') !== null;
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  isCustomerAdmin() {
    return localStorage.getItem('role').includes('ROLE_CUSTOMER_ADMIN');
  }
}
