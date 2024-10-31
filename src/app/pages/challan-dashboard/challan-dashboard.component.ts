import { Component } from '@angular/core';
import { ButtonChipsComponent } from '../trip-list/modules/button-chips/button-chips.component';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetClickEventDirective } from '../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ScrollByButtonDirective } from '../../shared/directive/scroll-by-button.directive';
import { ChallanDashboardService } from './challan-dashboard.service';
import { TripService } from '../trip-list/services/trip.service';
import { Trip } from '../auth/models/response/trip';

@Component({
  selector: 'app-challan-dashboard',
  standalone: true,
  imports: [
    ButtonChipsComponent,
    CustomInputComponent,
    DatePipe,
    DecimalPipe,
    FormsModule,
    GetClickEventDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    LoadingComponent,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    NgForOf,
    NgIf,
    ScrollByButtonDirective,
    NgClass,
    NgOptimizedImage,
  ],
  templateUrl: './challan-dashboard.component.html',
  styleUrl: './challan-dashboard.component.scss',
})
export class ChallanDashboardComponent {
  height: any = '0px';
  pendingChallanAmount: number = 120000;
  pendingChallanText: string = 'Pending challan value for 30 trips';
  receivedAmount: number = 75;
  receivedText: string = 'Received';
  pendingAmount: number = 25;
  pendingText: string = 'In-progress';
  approvedAmount: number = 25;
  approvedText: string = 'Approved';
  rejectedAmount: number = 25;
  rejectedText: string = 'Rejected';
  completedTrips: number = 80;
  completedTripsText: string = 'No. of completed trips';
  hardCopyReceived: number = 40;
  hardCopyReceivedText: string = 'Hardcopy received';
  fromDate: string;
  toDate: string;
  private size: number = 30;
  protected loading: boolean;
  private page: number = 0;
  protected tripList: Trip[] = [];
  protected totalPages: any = 0;
  private anotherStatusCalled: boolean;
  activatedChallanStatus: string = 'Pending';

  constructor(
    private datePipe: DatePipe,
    private service: ChallanDashboardService,
    private trip: TripService,
    private number: DecimalPipe
  ) {}

  ngOnInit() {
    this.getFromDateAndToDate();
    this.getChallanStatus();
    this.getTripList();
  }
  private getFromDateAndToDate() {
    // fromdate will be the first day of the current month
    // fromDate will be 1st january 2024
    const fromDate = new Date();
    fromDate.setFullYear(2024);
    fromDate.setMonth(0);
    fromDate.setDate(1);
    this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd');
    // todate should be the current date
    const toDate = new Date();
    // to date will be the last day of the current month
    this.toDate = this.datePipe.transform(
      new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0),
      'yyyy-MM-dd'
    );
  }

  private getChallanStatus() {
    this.service
      .getChallanStatus(this.fromDate, this.toDate)
      .subscribe((res: any) => {
        this.pendingChallanAmount =
          res.data.totalCustomerRateForPendingChallans;
        this.receivedAmount = res.data.received;
        this.pendingAmount = res.data.inProgress;
        this.approvedAmount = res.data.approved;
        this.rejectedAmount = res.data.rejected;
        this.hardCopyReceived = res.data.totalHardCopyReceived;
      });
  }

  private getTripList() {
    this.loading = true;
    this.trip
      .getTrips(
        this.page,
        this.size,
        null,
        null,
        null,
        'Completed',
        null,
        null,
        null
      )
      .subscribe(
        (trip: any) => {
          this.updateTripList(trip);
        },
        error => {
          this.loading = false;
        }
      );
  }

  private updateTripList(trip: any) {
    this.loading = false;
    this.completedTrips = trip.data?.statusCount?.Completed || 0;
    this.totalPages = trip.data.totalPages;
    this.pendingChallanText = `Pending challan value for ${this.number.transform(trip.data?.challanStatusCount?.Pending) || 0} ${trip.data?.challanStatusCount?.Pending === 1 ? 'trip' : 'trips'}`;
    if (this.page === 0) {
      this.tripList = trip.data.responses;
    } else {
      this.tripList.push(...trip.data.responses);
    }
    this.loading = false;
  }
  onBottom($event: boolean) {
    if (!$event) {
      this.trip.anotherStatusCalled.next(false);
    }
    if ($event && this.page < this.totalPages - 1) {
      if (this.anotherStatusCalled) {
      } else {
        this.page++;
        this.size = 30;
        this.loading = false;
        this.getTripList();
      }
    }
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  getCountOfGp(trip: Trip) {
    return trip.customerRate && trip.transporterRate
      ? trip.customerRate - trip.transporterRate
      : 'N/A';
  }
}


