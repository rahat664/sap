import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { TransporterPayment } from '../../../pages/payment/model/transporter-payment.model';
import { numberPipe } from '../../pipes/number-seperator.pipe';
import { tripTypes } from '../../../pages/auth/models/response/trip';
import { TripService } from '../../../pages/trip-list/services/trip.service';
import { MatDialog } from '@angular/material/dialog';
import {
  PaymentSuccessfulModalComponent
} from '../../../pages/payment/payment-successful-modal/payment-successful-modal.component';
import { HandleToastrService } from '../../services/handle-toastr/handle-toastr.service';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { GetClickEventDirective } from '../../directive/get-click-event.directive';
import { bkashPaymentMethod } from '../../../pages/profiles/components/transporter/models/payment-method';
import { CustomInputSelectModel } from '../custom-input/custom-input-select.model';
import { MatCalendar, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatCard } from '@angular/material/card';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-off-canvas',
  imports: [
    MatRadioButton,
    MatFormField,
    FormsModule,
    MatInput,
    NgForOf,
    DecimalPipe,
    numberPipe,
    MatRadioGroup,
    NgIf,
    ReactiveFormsModule,
    CustomInputComponent,
    GetClickEventDirective,
    DatePipe,
    MatButton,
    MatCalendar,
    MatCard,
    MatDatepickerToggle,
    MatMenu,
    MatSuffix,
    MatTooltip,
    TimePickerComponent,
    MatMenuTrigger,
  ],
  providers: [
    provideNativeDateAdapter(),
  ],
  templateUrl: './off-canvas.component.html',
  styleUrl: './off-canvas.component.scss',
})
export class OffCanvasComponent {
  paymentMethods: any[] = [
    { name: 'Cash', icon: 'cash.svg' },
    { name: 'Bank', icon: 'bank.svg' },
    { name: 'MFS', icon: 'mfs.svg' },
  ];
  mfsService: CustomInputSelectModel[] = [
    { id: 1, value: 'bKash', selected: false },
    { id: 2, value: 'Nagad', selected: false },
  ];
  readonly dialog = inject(MatDialog);
  @Output() closeCanvas: EventEmitter<void> = new EventEmitter<void>();
  @Output() isPaymentSuccessful: EventEmitter<boolean> =
    new EventEmitter<boolean>(false);
  paymentStatus: string;
  readonly minDate = new Date();
  private time: any;
  selectedDate: Date = new Date();
  amount: any;
  @Input() transporterDetails: TransporterPayment;
  paymentButtonTriggered: boolean;
  financialInstituteName: string = '';
  accountNumber: string = '';
  accountName: string = '';
  protected returnToInputDate: any;
  isDisabled: boolean;
   paymentDate: any;
  constructor(
    private trip: TripService,
    private toaster: HandleToastrService,
    private datePipe: DatePipe
  ) {}

  onClose() {
    this.closeCanvas.emit();
  }

  onPaymentStatusChange($event: MatRadioChange) {
    this.paymentStatus = $event.source.value;
    if ($event.source.value === 'full') {
      this.amount =
        this.transporterDetails?.transporterRate -
        this.transporterDetails?.paymentAmountToTransporter;
    }
  }

  ngOnInit() {
    this.returnToInputDate = new Date();
    this.paymentDate = this.datePipe.transform(
      this.returnToInputDate, 'd MMM yyy, hh:mm a'
    )
  }

  onPayNow() {
    this.paymentButtonTriggered = true;
    if (this.amount > 0 && this.selectedPaymentMethod && this.paymentStatus) {
      const paymentData = {
        tripIds: [this.transporterDetails.tripId],
        amount: this.amount,
        paymentMethod: this.selectedPaymentMethod.toString().toUpperCase(),
        paymentDate: this.datePipe.transform(
          this.paymentDate, 'yyyy-MM-ddTHH:mm:ss'
        )
      };
      if (this.selectedPaymentMethod === 'Bank') {
        // add a new property to the paymentData object
        if (this.financialInstituteName) {
          paymentData['financialInstituteName'] = this.financialInstituteName;
        }
        if (this.accountNumber) {
          paymentData['accountNumber'] = this.accountNumber;
        }
        if (this.accountName) {
          paymentData['accountName'] = this.accountName;
        }
      }

      if (this.selectedPaymentMethod === 'MFS') {
        if (this.financialInstituteName) {
          paymentData['financialInstituteName'] = this.financialInstituteName;
        }
        if (this.accountNumber) {
          paymentData['accountNumber'] = this.accountNumber;
        }
      }

      this.trip.paymentTransporter(paymentData).subscribe({
        next: res => {
          this.dialog
            .open(PaymentSuccessfulModalComponent, {
              width: '21.375rem',
              data: {
                title: 'Success',
                text: `Your ${this.amount}(৳) payment(${this.paymentStatus})  for the trip ${this.transporterDetails?.tripId} has been completed`,
                buttonText: 'Okay',
              },
            })
            .afterClosed()
            .subscribe(
              () => {
                this.isPaymentSuccessful.emit(true);
                this.closeCanvas.emit();
              },
              error => {
                this.toaster.showError('Error', error.error.message);
              }
            );
        },
        error: err => {
          this.toaster.showError('Error', err.error.message);
        },
      });
    } else {
      this.toaster.showError(`Please select payment method, status and amount`);
    }
  }

  onPaymentMethodChange($event: MatRadioChange) {
    if ($event.source.checked) {
      this.selectedPaymentMethod = $event.source.value;
    }
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

  countDueAmount(transporter: TransporterPayment) {
    if (transporter.transporterRate !== null) {
      const dueAmount =
        transporter.transporterRate - transporter.paymentAmountToTransporter;
      return dueAmount > 0 ? dueAmount : 0;
    } else {
      return 'N/A';
    }
  }

  protected readonly tripTypes = tripTypes;
  selectedPaymentMethod: any;

  onPaymentAmountChange($event: Event, transporterDetails: TransporterPayment) {
    const dueAmount =
      transporterDetails.transporterRate -
      transporterDetails.paymentAmountToTransporter;
    const input = $event.target as HTMLInputElement;
    const value = Number(input.value);
    if (value > dueAmount) {
      input.value = dueAmount.toString();
      this.amount = dueAmount;
    } else {
      this.amount = value;
    }
  }
  mfsTypePlaceholder: string = '';
  paidOnDate: any;

  onSelectMFSType($event: number) {
    this.mfsTypePlaceholder = this.mfsService.find(
      method => method.id === $event
    ).value;
    this.financialInstituteName = this.mfsTypePlaceholder;
    this.mfsService.forEach(method => (method.selected = method.id === $event));
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

  onFocusOut() {
    this.checkTheAmountIsFullOrPartial();
  }

  private checkTheAmountIsFullOrPartial() {
    if (this.amount > 0) {
      if (this.amount === this.countDueAmount(this.transporterDetails)) {
        this.paymentStatus = 'full';
      } else {
        this.paymentStatus = 'partial';
      }
    } else {
      this.paymentStatus = '';
    }
  }

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }

  onSelect($event: any) {
    this.selectedDate = $event;
    this.returnToInputDate = $event;
  }

  isButtonDisabled($event: boolean) {
    this.isDisabled = $event
  }
  onTimeChange($event: any) {
    this.time = $event;
  }

  onSelectTimeAndDate() {
    // convert time to 24-hour format
    const time = this.time.split(' ')[0];
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);
    const amOrPm = this.time.split(' ')[1];
    const timeIn24HourFormat = amOrPm === 'PM' ? hour + 12 : hour;
    const selectedDate = this.selectedDate;
    selectedDate.setHours(timeIn24HourFormat, hour);
    selectedDate.setMinutes(minute);
    this.paymentDate = this.datePipe.transform(
      this.selectedDate, 'd MMM yyy, hh:mm a'
    )
  }
}
