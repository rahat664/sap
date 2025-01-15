import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { DashboardService } from '../../pages/dashboard/services/dashboard.service';
import { forkJoin, of, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { catchError, map, switchMap } from 'rxjs/operators';

export const dashboardDataResolver: ResolveFn<Observable<any>> = (
  route,
  state
) => {
  const dashboardService = inject(DashboardService);
  const datePipe = inject(DatePipe);

  // Get the from and to date for the current month
  const from = datePipe.transform(new Date(), 'yyyy-MM-01');
  const to = datePipe.transform(new Date(), 'yyyy-MM-dd');

  const type = 'daily';
  const selectedMonth =
    (new Date().getMonth() + 1).toString().length === 1
      ? '0' + (new Date().getMonth() + 1).toString()
      : (new Date().getMonth() + 1).toString();
  const selectedYear = new Date().getFullYear();
  const value = `${selectedYear}-${selectedMonth}`;

  // Emit a loading state before data is resolved
  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return forkJoin({
        apiStats: dashboardService.getApiStats(from, to),
        customerStats: dashboardService.getCustomerStats(from, to),
        challanStatus: dashboardService.getChallanStatus(from, to),
        tripCountByStatus: dashboardService.getTripCountByStatus(from, to),
        topTransporters: dashboardService.getTopTransporters(from, to),
        topCustomers: dashboardService.getTopCustomers(from, to),
        transporterRateAnalysisData:
          dashboardService.getTransporterRateAnalysisData(type, value),
      }).pipe(
        map(data => {
          return {
            loading: false, // Set loading to false when data is resolved
            data,
          };
        }),
        catchError(error => {
          console.error('Error in dashboard data resolver', error);
          return of({
            loading: false, // Set loading to false on error
            error: true,
            message: 'Error in dashboard data resolver',
          });
        })
      );
    })
  );
};
