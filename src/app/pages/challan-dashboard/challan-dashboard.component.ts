import { Component, inject, Inject } from '@angular/core';
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
import { Trip, Truck } from '../auth/models/response/trip';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmApproveComponent } from '../../shared/modules/confirm-approve/confirm-approve.component';
import { ConfirmRejectComponent } from '../../shared/modules/confirm-reject/confirm-reject.component';
import {
  ConfirmReceiveeComponentComponent
} from '../../shared/modules/confirm-receivee-component/confirm-receivee-component.component';
import { RouterLink } from '@angular/router';

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
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
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
  chalanStatus: string;
  status: string;
  challanHardCopyReceived: boolean;
  readonly dialog = inject(MatDialog);

  constructor(
    private datePipe: DatePipe,
    private service: ChallanDashboardService,
    private trip: TripService,
    private number: DecimalPipe
  ) {}

  ngOnInit() {
    this.activatedChallanStatus = 'Pending';
    this.chalanStatus = 'Pending';
    this.status = 'Completed';
    this.getFromDateAndToDate();
    this.getChallanStatus();
    this.loading = true;
    this.anotherStatusCalled = false;
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
    this.trip
      .getTrips(
        this.page,
        this.size,
        null,
        null,
        null,
        this.status,
        null,
        null,
        null,
        this.chalanStatus,
        this.challanHardCopyReceived
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
  }
  onBottom($event: boolean) {
    if (!$event) {
      this.trip.anotherStatusCalled.next(false);
    }
    if ($event && this.page < this.totalPages - 1) {
      if (this.anotherStatusCalled) {
      } else {
        this.loading = false;
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

  onClickStatusButtons(status: any) {
    this.challanHardCopyReceived = false;
    this.activatedChallanStatus = status;
    this.chalanStatus = status;
    if (status === 'Completed') {
      this.status = 'Completed';
      this.chalanStatus = null;
    } else if (status === 'hardcopy') {
      this.chalanStatus = null;
      this.challanHardCopyReceived = true;
    }
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.tripList = [];
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  changeStatus(id, name, status: string) {
    const body = {
      challanStatus: status,
    };
    if (status === 'Approved') {
      this.dialog
        .open(ConfirmApproveComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the challan for tripId ',
            text: `${name}?`,
            buttonText: 'Approve',
          },
        })
        .afterClosed()
        .subscribe(res => {
          if (res) {
            this.service.updateChallanStatus(id, body).subscribe((res: any) => {
              this.page = 0;
              this.getChallanStatus();
              this.getTripList();
            });
          }
        });
    } else {
      this.dialog
        .open(ConfirmRejectComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the challan for tripId ',
            text: `${name}?`,
            buttonText: 'Reject',
            reasonAvailable: false,
          },
        })
        .afterClosed()
        .subscribe(res => {
          if (res) {
            this.service.updateChallanStatus(id, body).subscribe((res: any) => {
              this.page = 0;
              this.getChallanStatus();
              this.getTripList();
            });
          }
        });
    }
  }

  getFullRegistrationNumber(truck: Truck) {
    if (truck) {
      return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial}-${truck.registrationNum}`;
    } else {
      return 'truck not found';
    }
  }

  getBgColor(challanStatus: string) {
    switch (challanStatus) {
      case 'Pending':
        return 'bg-another';
      case 'Approved':
        return 'bg-green';
      case 'Rejected':
        return 'bg-red';
      case 'In-Progress':
        return 'bg-yellow';
      default:
        return 'bg-another';
    }
  }

  checkDueDays(trip: Trip) {
    const tripCompletedDate = new Date(trip.tripEndedAt);
    if (trip.challanStatusUpdatedAt) {
      const challanStatusUpdatedDate = new Date(trip.challanStatusUpdatedAt);
      return this.datePipe.transform(challanStatusUpdatedDate, 'dd MMM,yyyy');
    } else {
      // return due days from trip end date
      const currentDate = new Date();
      const diffTime = Math.abs(
        currentDate.getTime() - tripCompletedDate.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  }

  onClickHardCopyReceive(tripId: string) {
    const body = {
      hardCopyReceivedAt: new Date().toISOString(),
    };
    this.dialog
      .open(ConfirmReceiveeComponentComponent, {
        data: {
          title: 'Attention',
          textPrefix: 'Have you received the hardcopy for ',
          text: `${tripId}?`,
          buttonText: 'Receive',
        },
      })
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.service
            .updateChallanStatus(tripId, body)
            .subscribe((res: any) => {
              this.page = 0;
              this.getChallanStatus();
              this.getTripList();
            });
        }
      });
  }
}


