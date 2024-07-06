// src/app/store/effects/auth.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { login, loginFailure, loginSuccess, logout } from './auth.action';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      mergeMap(action =>
        this.authService.login(action.payload).pipe(
          map(response => {
            // @ts-ignore
            if (response.status === 'OK') {
              return loginSuccess({ response });
            } else {
              return loginFailure({ error: response.message });
            }
          }),
          catchError(error => of(loginFailure({ error }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ response }) => {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('email', response.data.email);
          localStorage.setItem('name', response.data.name);
          localStorage.setItem('image', response.data.image || '');
          localStorage.setItem('role', response.data.roles[0]);
          this.toaster.showSuccess('Login Successful', '');
          this.router.navigate(['/trip-list']); // Change to your desired route
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          localStorage.clear();
          this.router.navigateByUrl('/auth/login');
        }),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private toaster: HandleToastrService,
  ) {
  }
}
