import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetElementHeightDirective } from '../../../shared/directive/get-element-height.directive';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { GiveMaxHeightDirective } from '../../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../../shared/modules/loading/loading.component';
import { OffCanvasComponent } from '../../../shared/modules/off-canvas/off-canvas.component';
import { TripService } from '../../trip-list/services/trip.service';
import { TransporterPayment } from '../model/transporter-payment.model';
import { numberPipe } from '../../../shared/pipes/number-seperator.pipe';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';
import { PaymentFilterComponent } from '../payment-filter/payment-filter.component';

@Component({
  selector: 'app-payment',
  imports: [
    FormsModule,
    GetElementHeightDirective,
    NgIf,
    CommonModule,
    GiveMaxHeightDirective,
    LoadingComponent,
    OffCanvasComponent,
    numberPipe,
    PaymentDetailsComponent,
    PaymentFilterComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  height: any;
  filterOpened: boolean = false;
  searchValue: any;
  transporterName: any;
  tripId: any;
  page: number = 0;
  size: number = 20;
  paymentData: {
    totalTransportRate: number;
    totalPaid: number;
    totalUnpaid: number;
  } = {
    totalTransportRate: 0,
    totalPaid: 0,
    totalUnpaid: 0,
  };
  transportersPaymentList: TransporterPayment[] = [];
  anotherStatusCalled: boolean;
  selectedTransporter: TransporterPayment;
  protected filterData: any = {};

  constructor(
    private trip: TripService,
    private service: TripService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.transporterPaymentList();
    const paymentFilter = localStorage.getItem('paymentFilter');
    if(paymentFilter) {
      localStorage.removeItem('paymentFilter');
    }
  }

  protected readonly localStorage = localStorage;
  totalPages: number = 0;
  loading: boolean = false;
  totalTrips: number = 0;
  isOffCanvasVisible: boolean = false;

  onBottom($event: boolean) {
    if (!$event) {
      this.service.anotherStatusCalled.next(false);
    }
    if ($event && this.page < this.totalPages - 1) {
      if (this.anotherStatusCalled) {
      } else {
        this.page++;
        this.size = 30;
        this.loading = false;
        this.trip.getTransporterPaymentList(this.page, this.size).subscribe(
          (res: any) => {
            this.transportersPaymentList.push(...res.data.responses);
          },
          (error: any) => {
            this.loading = false;
            console.error('Error fetching transporter payment list:', error);
          }
        );
      }
    }
  }

  onClickPayNow(transporter: TransporterPayment) {
    this.selectedTransporter = transporter;
    this.isOffCanvasVisible = true;
  }

  hideOffCanvas() {
    this.isOffCanvasVisible = false;
  }

  private transporterPaymentList() {
    this.loading = true;
    this.trip.getTransporterPaymentList(this.page, this.size).subscribe(
      (res: any) => {
        this.transportersPaymentList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.paymentData = res.data.paymentData;
        this.totalTrips = res.data.totalItems;
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        console.error('Error fetching transporter payment list:', error);
      }
    );
  }

  getLoadingPointsName(
    tripPoints: Array<{
      id: number;
      pointDistrict: string;
      pointName: string;
      pointType: string;
      pointLat: number;
      pointLon: number;
    }>
  ) {
    return tripPoints.filter(trip => trip.pointType === 'Loading');
  }

  getUnloadingPointsName(
    tripPoints: Array<{
      id: number;
      pointDistrict: string;
      pointName: string;
      pointType: string;
      pointLat: number;
      pointLon: number;
    }>
  ) {
    return tripPoints.filter(trip => trip.pointType === 'Unloading');
  }

  countDueAmount(transporter: TransporterPayment) {
    if (transporter.transporterRate !== null) {
      const dueAmount =
        transporter.transporterRate - transporter.paymentAmountToTransporter;
      return dueAmount > 0 ? dueAmount : 0;
    } else {
      return 'N/A';
    }
  }

  protected readonly Number = Number;
  paymentDetailsOpened: boolean = false;
  filterApplied: boolean = false;


  onPaymentSucceful($event: boolean) {
    if ($event) {
      this.transportersPaymentList = [];
      this.page = 0;
      this.loading = true;
      this.size = 30;
      this.trip.getTransporterPaymentList(this.page, this.size,
        this.filterData.tripStatus,
        this.filterData.startDate,
        this.filterData.endDate,
        this.filterData.tripId,
        this.filterData.customerCode,
        this.filterData.paymentStatus,
        this.filterData.loadingDistrict,
        this.filterData.unloadingDistrict).subscribe(
        (res: any) => {
          this.transportersPaymentList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.paymentData = res.data.paymentData;
          this.totalTrips = res.data.totalItems;
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          console.error('Error fetching transporter payment list:', error);
        }
      );
    }
  }

  hideDetails() {
    this.paymentDetailsOpened = false;
  }

  onClickTripId(transporter: TransporterPayment) {
    this.filterOpened = false;
    this.isOffCanvasVisible = false;
    this.selectedTransporter = transporter;
    this.paymentDetailsOpened = true;
  }

  onPaymentFromDetails() {
    this.paymentDetailsOpened = false;
    this.isOffCanvasVisible = true;
  }

  onClickFilterOpen() {
    this.filterOpened = true;
  }

  onFilterClose() {
    this.filterOpened = false;
  }

  onfilterApply() {
    if(
      this.filterData.tripStatus ||
      this.filterData.startDate ||
      this.filterData.endDate ||
      this.filterData.tripId ||
      this.filterData.customerCode ||
      this.filterData.paymentStatus ||
      this.filterData.loadingDistrict ||
      this.filterData.unloadingDistrict
    ) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.loading = true;
      this.transportersPaymentList = []
      this.page = 0;
      this.size = 30;
      this.trip.getTransporterPaymentList(
        this.page,
        this.size,
        this.filterData.tripStatus,
        this.filterData.startDate,
        this.filterData.endDate,
        this.filterData.tripId,
        this.filterData.customerCode,
        this.filterData.paymentStatus,
        this.filterData.loadingDistrict,
        this.filterData.unloadingDistrict
      ).subscribe(
        (res: any) => {
          this.transportersPaymentList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.paymentData = res.data.paymentData;
          this.totalTrips = res.data.totalItems;
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          console.error('Error fetching transporter payment list:', error);
        }
      );
    } else {
      this.filterApplied = false;
      return;
    }

  }

  onFilterData($event: any) {
    this.filterData = $event;

  }

  get filterSummary(): string {
    const parts: string[] = [];

    if (this.filterData.searchName) parts.push(`Company: ${this.filterData.searchName}`);
    if (this.filterData.startDate) parts.push(`From: ${this.datePipe.transform(this.filterData.startDate, 'dd MMM yyyy')}`);
    if (this.filterData.endDate) parts.push(`To: ${this.datePipe.transform(this.filterData.endDate, 'dd MMM yyyy')}`);
    if (this.filterData.paymentStatus) parts.push(`Payment Status: ${this.filterData.paymentStatus}`);
    if (this.filterData.tripStatus) parts.push(`Trip Status: ${this.filterData.tripStatus}`);
    if (this.filterData.tripId) parts.push(`Trip ID: ${this.filterData.tripId}`);
    if (this.filterData.loadingDistrict) parts.push(`Loading District: ${this.filterData.loadingDistrict}`);
    if (this.filterData.unloadingDistrict) parts.push(`Unloading District: ${this.filterData.unloadingDistrict}`);

    return parts.join(', ');
  }

  onCLickClearAll() {
    this.filterData = {};
    this.filterApplied = false;
    this.filterOpened = false;
    this.loading = true;
    this.page = 0;
    this.size = 30;
    localStorage.removeItem('paymentFilter');
    this.trip.getTransporterPaymentList(this.page, this.size).subscribe(
      (res: any) => {
        this.transportersPaymentList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.paymentData = res.data.paymentData;
        this.totalTrips = res.data.totalItems;
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        console.error('Error fetching transporter payment list:', error);
      }
    );
  }
}
