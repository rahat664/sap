import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../pages/profiles/services/user.service';
import { inject } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';

export const userResolver: ResolveFn<Observable<any>> = (route, state) => {
  const page = 0;
  const size = 30;
  const status = 'Active';
  const userService = inject(UserService);

  const loadingState = of({
    loading: true,
    data: null,
  });

  const params = {
    search: '',
    page: page,
    size: size,
    department: '',
    status: status || null,
  };

  return loadingState.pipe(
    switchMap(() => {
      return userService.getUsers(params).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in user resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in user resolver',
          });
        })
      );
    })
  );
};
