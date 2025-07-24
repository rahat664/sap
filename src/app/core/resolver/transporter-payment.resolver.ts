import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../pages/profiles/services/user.service';
import { inject } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import {CustomerService} from "../../pages/profiles/services/customer.service";
import {TripService} from "../../pages/trip-list/services/trip.service";

export const transporterPaymentResolver: ResolveFn<Observable<any>> = (route, state) => {
  const transporterService = inject(TripService);

  const loadingState = of({
    loading: true,
    data: null,
  });

  const page = 0;
  const size = 20;

  return loadingState.pipe(
    switchMap(() => {
      return transporterService.getTransporterPaymentList(page, size).pipe(
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
