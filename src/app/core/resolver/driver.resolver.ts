import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { inject } from '@angular/core';
import { UserService } from '../../pages/profiles/services/user.service';
import { catchError, map, switchMap } from 'rxjs/operators';

export const driverResolver: ResolveFn<Observable<any>> = (route, state) => {
  const driver = inject(UserService);
  const page = 0;
  const size = 30;
const hasDocuments = true;
  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return driver.getDriver(page, size, null,null, null, null, hasDocuments).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in driver resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in driver resolver',
          });
        })
      );
    })
  );
};
