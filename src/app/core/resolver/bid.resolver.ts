import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../../pages/profiles/services/user.service';
import { inject } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import {CustomerService} from "../../pages/profiles/services/customer.service";
import {BidService} from "../../pages/manage-bid/services/bid.service";

export const bidResolver: ResolveFn<Observable<any>> = (route, state) => {
  const bidService = inject(BidService);

  const loadingState = of({
    loading: true,
    data: null,
  });

  const meta = {
    page: 0,
    limit: 30,
  };
  const body = {
    status: ['Bidded', 'Unbidded']
  };

  return loadingState.pipe(
    switchMap(() => {
      return bidService.getSessionBids(body, meta).pipe(
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
