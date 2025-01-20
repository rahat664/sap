import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TripService } from '../../pages/trip-list/services/trip.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const tripListResolver: ResolveFn<Observable<any>> = (route, state) => {
  const tripService = inject(TripService);
  const page = 0;
  const size = 30;

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return tripService.getTrips(page, size).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in challan details data resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in challan details data resolver',
          });
        })
      );
    })
  );
};
