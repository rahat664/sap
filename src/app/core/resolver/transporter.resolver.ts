import { ResolveFn } from '@angular/router';
import { UserService } from '../../pages/profiles/services/user.service';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const transporterResolver: ResolveFn<Observable<any>> = (
  route,
  state
) => {
  const page = 0;
  const size = 30;
  const transporterService = inject(UserService);

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return transporterService.getTransporter(page, size).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in transporter resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in transporter resolver',
          });
        })
      );
    })
  );
};
