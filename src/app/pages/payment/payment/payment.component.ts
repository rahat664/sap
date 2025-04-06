import { Component } from '@angular/core';
import { CustomInputComponent } from '../../../shared/modules/custom-input/custom-input.component';
import { FormsModule } from '@angular/forms';
import { GetClickEventDirective } from '../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../shared/directive/get-element-height.directive';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CommonModule, NgIf } from '@angular/common';
import { GiveMaxHeightDirective } from '../../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../../shared/modules/loading/loading.component';
import { OffCanvasComponent } from '../../../shared/modules/off-canvas/off-canvas.component';
import { TripService } from '../../trip-list/services/trip.service';
import { TransporterPayment } from '../model/transporter-payment.model';

@Component({
  selector: 'app-payment',
  imports: [
    FormsModule,
    GetElementHeightDirective,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    NgIf,
    CommonModule,
    GiveMaxHeightDirective,
    LoadingComponent,
    OffCanvasComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  height: any;
  filterOpened: boolean = true;
  searchName: any;
  tripSuggestions: any;
  searchValue: any;
  searchRegistationId: any;
  truckRegSuggestions: any;
  truckRegistrationId: any;
  searchTransporter: any;
  transporterSuggestions: any;
  transporterName: any;
  searchId: any;
  tripIdSuggestions: any;
  tripId: any;
  page: number = 0;
  size:number = 20;
  paymentData: {
    totalTransportRate: number;
    totalPaid: number;
    totalUnpaid: number;
  } = {
    totalTransportRate: 0,
    totalPaid: 0,
    totalUnpaid: 0,
  }
  transportersPaymentList: TransporterPayment[] = [];

  constructor(private trip: TripService) {
  }

  ngOnInit() {
    this.transporterPaymentList();
  }

  onClickFilterOpened() {}

  getFilterLength() {
    return 0;
  }

  onClearFilter() {}

  onSearchInputChange($event: KeyboardEvent) {}

  onClickSearchSuggestion(option: any) {}

  onClickClearCompany() {}

  onKeyUpTruckSearch($event: KeyboardEvent) {}

  onClickTruckSearchSuggestion(option: any) {}

  onClickClearTruck() {}

  onKeyUpTransporterSearch($event: KeyboardEvent) {}

  onClickTransporterSearchSuggestion(option: any) {}

  onClickClearTransporter() {}

  onKeyUpTripSearch($event: KeyboardEvent) {}

  onClickTripSearchSuggestion(option: any) {}

  onClickClearTripId() {}

  protected readonly localStorage = localStorage;
  totalPages: number = 0;
  loading: boolean = false;
  totalTrips: any[] = Array(100);
  isOffCanvasVisible: boolean = false;

  onBottom($event: boolean) {}

  onClickPayNow() {
    this.isOffCanvasVisible = true;
  }

  hideOffCanvas() {
    this.isOffCanvasVisible = false;
  }

  private transporterPaymentList() {
    this.trip.getTransporterPaymentList(this.page, this.size).subscribe((res: any) => {
      this.transportersPaymentList = res.data.responses;
      this.totalPages = res.data.totalPages;
      this.paymentData = res.data.paymentData;
      this.totalTrips = res.data.totalItems;
      this.loading = false;
    }, (error: any) => {
      this.loading = false;
      console.error('Error fetching transporter payment list:', error);
    })
  }
}
