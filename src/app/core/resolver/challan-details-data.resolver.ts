import { ResolveFn } from '@angular/router';
import { TripService } from '../../pages/trip-list/services/trip.service';
import { inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const challanDetailsDataResolver: ResolveFn<Observable<any>> = (
  route,
  state
) => {
  // get id from route
  const id = route.params['id'];

  const tripService = inject(TripService);

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return forkJoin({
        loadingEvents: tripService.getAllTripEvent(id, 'Loading'),
        unloadingEvents: tripService.getAllTripEvent(id, 'Unloading'),
        tripData: tripService.getTripDetailsByTripId(id),
      }).pipe(
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
