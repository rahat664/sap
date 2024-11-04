// src/app/store/effects/auth.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  login,
  loginFailure,
  loginSuccess,
  loginUsingPhoneNumber,
  logout,
} from './auth.action';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../profiles/services/user.service';

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
          catchError(error => of(loginFailure({ error })))
        )
      )
    )
  );

  loginUsingPhoneNumber$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUsingPhoneNumber),
      mergeMap(action =>
        this.authService.verifyOtp(action.payload).pipe(
          map(response => {
            // @ts-ignore
            if (response.status === 'OK') {
              return loginSuccess({ response });
            } else {
              return loginFailure({ error: response.message });
            }
          }),
          catchError(error => of(loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ response }) => {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('email', response.data.email);
          localStorage.setItem('name', response.data.name);
          localStorage.setItem('image', response.data.image || '');
          localStorage.setItem('role', JSON.stringify(response.data.roles));
          localStorage.setItem('userPhoneNumber', response.data.phone);
          // Change to your desired route
          this.user.getUserPermissions().subscribe((permissions: any) => {
            if (permissions.status == 'OK') {
              localStorage.setItem(
                'permissions',
                JSON.stringify(permissions.data)
              );
              this.toaster.showSuccess('Login Successful', '');
              this.isAdmin() ? this.router.navigate(['/dashboard']) : this.router.navigate(['/trip-list']);
            } else {
              this.toaster.showError(permissions.message, '');
            }
          });
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          localStorage.clear();
          this.router.navigateByUrl('/auth/login');
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private toaster: HandleToastrService,
    private user: UserService
  ) {}

  isAdmin() {
    const role = localStorage.getItem('role');
    if (role) {
      return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
    } else {
      return false;
    }
  }
}
