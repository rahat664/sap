import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { TripService } from '../../trip-list/services/trip.service';

@Injectable({ providedIn: 'root' })
export class ManageTripFacade {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private tripService: TripService) {}

  loadTrips(
    page: number,
    size: number,
    customerCodesCsv?: string,
    startDate?: string,
    endDate?: string,
    status?: string,
    searchValue?: string,
    truckTypeCsv?: string,
    onlyTripId?: string,
    chalanStatus?: string,
    challanHardCopyReceived?: boolean,
    challanFrom?: string,
    challanTo?: string,
    truckRegId?: string,
    transporterNameOrPhone?: string,
    paymentTypeCsv?: string,
    tripTypeCsv?: string,
    transporterCodesCsv?: string
  ): Observable<any> {
    if (page === 0) {
      this.loadingSubject.next(true);
    }
    return this.tripService
      .getTrips(
        page,
        size,
        customerCodesCsv,
        startDate,
        endDate,
        status,
        searchValue,
        truckTypeCsv,
        onlyTripId,
        chalanStatus,
        challanHardCopyReceived,
        challanFrom,
        challanTo,
        truckRegId,
        transporterNameOrPhone,
        paymentTypeCsv,
        tripTypeCsv,
        transporterCodesCsv
      )
      .pipe(finalize(() => this.loadingSubject.next(false)));
  }

  loadTripDetails(tripId: string): Observable<any> {
    return this.tripService.getTripDetailsByTripId(tripId);
  }

  loadVehicleTypes(): Observable<any[]> {
    // Normalize to array of vehicle types regardless of backend wrapper
    return this.tripService.getVehicleTypeList().pipe(
      map((res: any) => (res?.data ? res.data : res))
    );
  }
}

