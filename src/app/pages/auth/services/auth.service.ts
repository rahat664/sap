import { Injectable } from '@angular/core';
import {catchError, map, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiResponse} from "../models/response/api-response";
import {LoginRequest} from "../models/request/login-request";
import {environment} from "../../../../environments/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  login(payload: LoginRequest): Observable<any> {


    return this.http.post<ApiResponse>(environment.userUrl + '/auth/login', payload).pipe(map (response => {
        if(response.statusCode == 200){
          const loginResponse = response.data;
          localStorage.setItem('accessToken', loginResponse.accessToken);
          localStorage.setItem('email', loginResponse.email);
          localStorage.setItem('name', loginResponse.name);
          localStorage.setItem('image', loginResponse.image ? loginResponse.image : '');
          return loginResponse;
        }

        if(response.statusCode == 400){

          throw new Error(response.message);
        }
      }
    )).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {

    let message = "";

    if (error.status === 0) {

      message = 'Network connection problem!'
    }
    else {

      message = error.message;
    }

    return throwError(() => new Error(message));
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/auth/login');
  }

  isLoggedIn() {
    return localStorage.getItem('accessToken') !== null;
  }
}
