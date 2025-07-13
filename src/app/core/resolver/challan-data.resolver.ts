import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ChallanDashboardService } from '../../pages/challan-dashboard/challan-dashboard.service';
import { UserService } from '../../pages/profiles/services/user.service';
import { TripService } from '../../pages/trip-list/services/trip.service';
import { CustomerService } from '../../pages/profiles/services/customer.service';
import { TruckService } from '../../pages/profiles/components/truck/services/truck.service';
import { DatePipe } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const challanDataResolver: ResolveFn<Observable<any>> = (
  route,
  state
) => {
  const challanService = inject(ChallanDashboardService);
  const tripService = inject(TripService);
  const datePipe = inject(DatePipe);
  const page = 0;
  const size = 30;
  const status = 'Completed';
  const fromDate = '2024-01-01';
  const toDate = datePipe.transform(new Date(), 'yyyy-MM-dd');

  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return forkJoin({
        tripData: tripService.getTrips(page, size, null, null, null, status),
      }).pipe(
        map(data => {
          return {
            loading: false,
            data,
          };
        }),
        catchError(error => {
          console.error('Error in challan data resolver', error);
          return of({
            loading: false,
            error: true,
            message: 'Error in challan data resolver',
          });
        })
      );
    })
  );
};
