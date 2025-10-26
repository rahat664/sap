import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TruckService } from '../../pages/profiles/components/truck/services/truck.service';

export const truckResolver: ResolveFn<Observable<any>> = (route, state) => {
  const truckService = inject(TruckService);
  const page = 0;
  const size = 30;
  const hasDocuments = true

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return truckService.getTruckList(page, size, null, null, null, null, null, null, null, hasDocuments).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in truck resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in truck resolver',
          });
        })
      );
    })
  );
};
