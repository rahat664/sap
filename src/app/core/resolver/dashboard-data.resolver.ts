import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { DashboardService } from '../../pages/dashboard/services/dashboard.service';
import { forkJoin, of, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { catchError, map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

export const dashboardDataResolver: ResolveFn<Observable<any>> = (route, state) => {
  const dashboardService = inject(DashboardService);
  const datePipe = inject(DatePipe);
  const activatedRoute = inject(ActivatedRoute);

  // Get the from and to date for the current month
  const from = datePipe.transform(new Date(), 'yyyy-MM-01');
  const to = datePipe.transform(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    'yyyy-MM-dd'
  );

  const type = 'daily';

  // Emit a loading state before data is resolved
  const loadingState = of({
    loading: true,
    data: null,
  });

  // Listen for query parameter changes
  return loadingState.pipe(
    switchMap(() =>
      activatedRoute.queryParams.pipe(
        switchMap((queryParams) => {
          // Optionally, use query params for custom logic (like filtering)
          const updatedFrom = queryParams['fromDate'] || from;
          const updatedTo = queryParams['toDate'] || to;

          return forkJoin({
            apiStats: dashboardService.getApiStats(updatedFrom, updatedTo),
            customerStats: dashboardService.getCustomerStats(updatedFrom, updatedTo),
            challanStatus: dashboardService.getChallanStatus(updatedFrom, updatedTo),
            tripCountByStatus: dashboardService.getTripCountByStatus(updatedFrom, updatedTo),
            topTransporters: dashboardService.getTopTransporters(updatedFrom, updatedTo),
            topCustomers: dashboardService.getTopCustomers(updatedFrom, updatedTo),
            transporterRateAnalysisData: dashboardService.getTransporterRateAnalysisData(
              type, updatedFrom, updatedTo
            ),
          }).pipe(
            map((data) => ({
              loading: false, // Set loading to false when data is resolved
              data,
            })),
            catchError((error) => {
              console.error('Error in dashboard data resolver', error);
              return of({
                loading: false, // Set loading to false on error
                error: true,
                message: 'Error in dashboard data resolver',
              });
            })
          );
        })
      )
    )
  );
};
