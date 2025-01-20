import { ResolveFn } from '@angular/router';
import { CustomerService } from '../../pages/profiles/services/customer.service';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const customerResolver: ResolveFn<Observable<any>> = (route, state) => {
  const customerService = inject(CustomerService);
  const page = 0;
  const size = 30;

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return customerService.getCustomer(page, size).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in customer resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in customer resolver',
          });
        })
      );
    })
  );
};
