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
  const from = route?.queryParams['fromDate'] || datePipe.transform(new Date(), 'yyyy-MM-01')
  const to = route?.queryParams['toDate'] || datePipe.transform(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    'yyyy-MM-dd'
  );
  const customerCode = route?.queryParams['customerCode'] || '';
  const paymentType = route?.queryParams['paymentType'] || '';
  const tripType = route?.queryParams['tripType'] || '';
  const truckTypeId = route?.queryParams['truckTypeId'] || '';
  const sortBy = 'grossProfit';

  const type = 'daily';
  const tripCountByDateType = 'monthly'
  const selectedMonth =
    (new Date().getMonth() + 1).toString().length === 1
      ? '0' + (new Date().getMonth() + 1).toString()
      : (new Date().getMonth() + 1).toString();
  const selectedYear = new Date().getFullYear();
  const fromDate = new Date();
  fromDate.setFullYear(2024);
  fromDate.setMonth(0);
  fromDate.setDate(1);
  const challanFromDate = route?.queryParams['fromDate'] || datePipe.transform(fromDate, 'yyyy-MM-dd');
  // todate should be the current date
  const toDate = new Date();
  // to date will be the last day of the current month
  const challanToDate = route?.queryParams['toDate'] || datePipe.transform(
    new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0),
    'yyyy-MM-dd'
  );

  const transporterCodes = route?.queryParams['transporterCodes'] || '';

  // Emit a loading state before data is resolved
  const loadingState = of({
    loading: true,
    data: null,
  });

  return loadingState.pipe(
    switchMap(() => {
      return forkJoin({
        apiStats: dashboardService.getApiStats(from, to, customerCode, paymentType, tripType, truckTypeId,transporterCodes),
        customerStats: dashboardService.getCustomerStats(from, to, customerCode, paymentType, tripType, truckTypeId, transporterCodes),
        challanStatus: dashboardService.getChallanStatus(challanFromDate, challanToDate , customerCode, paymentType, tripType, truckTypeId, transporterCodes),
        tripCountByDate: dashboardService.getDateWiseTripCount(challanFromDate, challanToDate, tripCountByDateType, customerCode, paymentType, tripType, truckTypeId, transporterCodes),
        topTransporters: dashboardService.getTopTransporters(challanFromDate, challanToDate, sortBy, customerCode, paymentType, tripType, truckTypeId, transporterCodes),
        topCustomers: dashboardService.getTopCustomers(challanFromDate, challanToDate, sortBy, paymentType, tripType, truckTypeId, transporterCodes),
        transporterRateAnalysisData:
          dashboardService.getTransporterRateAnalysisData(type, from, to, null, truckTypeId, null, null, customerCode, paymentType, tripType, transporterCodes),
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
