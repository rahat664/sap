import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TruckService } from '../../pages/profiles/components/truck/services/truck.service';

export const vehicleTrackingResolver: ResolveFn<Observable<any>> = (route, state) => {
  const truckService = inject(TruckService);
  const page = 0;
  const size = 1000;
  const trackerEnabled = true; // Assuming you want to filter by trackerEnabled

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return truckService.getTruckList(page, size,null,null, trackerEnabled).pipe(
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
