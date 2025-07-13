import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../pages/profiles/services/user.service';
import { inject } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import {CustomerService} from "../../pages/profiles/services/customer.service";

export const customerUserResolver: ResolveFn<Observable<any>> = (route, state) => {
  const userService = inject(CustomerService);

  const loadingState = of({
    loading: true,
    data: null,
  });

  const customerCode = localStorage.getItem('selectedCustomerCode')
  const page = 0;
  const size = 30;
  const status = 'Active';

  return loadingState.pipe(
    switchMap(() => {
      return userService.getCustomerUnderCompany(customerCode, page, size, status).pipe(
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
