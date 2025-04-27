import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransporterPayment, TransporterPaymentDetails } from '../model/transporter-payment.model';
import { TripService } from '../../trip-list/services/trip.service';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { LoadingComponent } from '../../../shared/modules/loading/loading.component';
import { numberPipe } from '../../../shared/pipes/number-seperator.pipe';
import { TripPoint } from '../../manage-trip/model/trip.details.model';

@Component({
  selector: 'app-payment-details',
  imports: [
    FormsModule,
    NgIf,
    LoadingComponent,
    DecimalPipe,
    numberPipe,
    NgForOf,
    DatePipe,
  ],
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.scss',
})
export class PaymentDetailsComponent {
  @Output() closeCanvas: EventEmitter<void> = new EventEmitter<void>();
  @Input() transporterDetails: TransporterPayment;
  loading: boolean;
  transporterPaymentDetails: TransporterPaymentDetails[] = [];
  @Output() paymentFromDetatils: EventEmitter<boolean> =
    new EventEmitter<boolean>(false);

  onClose() {
    this.closeCanvas.emit();
  }

  constructor(private trip: TripService) {}

  ngOnInit() {
    this.getPaymentDetails();
  }

  getTruckFullRegistrationNumber(truck: {
    id: number;
    registrationZone: string;
    registrationCategory: string;
    registrationSerial: string;
    registrationNum: string;
  }) {
    if (truck) {
      return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial}-${truck.registrationNum}`;
    } else {
      return 'N/A';
    }
  }

  private getPaymentDetails() {
    this.loading = true;
    this.trip.getPaymentDetails(this.transporterDetails?.tripId).subscribe(
      (response: any) => {
        this.transporterPaymentDetails = response.data;
        this.loading = false;
      },
      error => {
        console.error('Error fetching payment details', error);
        this.loading = false;
      }
    );
  }

  ngOnChanges() {
    if (this.transporterDetails) {
      this.getPaymentDetails();
    }
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

  onPayNow() {
    this.paymentFromDetatils.emit(true);
  }

  getLoadingPoint(
    tripPoints: Array<{
      id: number;
      pointDistrict: string;
      pointName: string;
      pointType: string;
      pointLat: number;
      pointLon: number;
    }>
  ) {
    return tripPoints.filter(point => point.pointType === 'Loading');
  }

  getUnloadingPoint(
    tripPoints: Array<{
      id: number;
      pointDistrict: string;
      pointName: string;
      pointType: string;
      pointLat: number;
      pointLon: number;
    }>
  ) {
    return tripPoints.filter(point => point.pointType === 'Unloading');
  }

  getBgColor(paymentStatus: string, type: string) {
    switch (paymentStatus) {
      case 'Paid':
        return type === 'bg' ? 'bg-[#D7F0E4]' : 'text-[#087D46]';
      case 'Unpaid':
        return type === 'bg' ? 'bg-[#FFE2DD]' : 'text-[#961801]';
      case 'Partial':
        return type === 'bg' ? 'bg-[#FFEED1]' : 'text-[#D38704]';
      default:
        return type === 'bg' ? 'bg-[#FFE2DD]' : 'text-[#961801]';
    }
  }
}
