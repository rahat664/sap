import { Component, Inject, inject } from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';
import { registrationZoneList } from '../../../profiles/components/truck/models/registration-zone';
import { registrationCategoryList } from '../../../profiles/components/truck/models/registration-category';
import { TransporterPopupComponent } from '../transporter-popup/transporter-popup.component';
import { TruckPopupComponent } from '../truck-popup/truck-popup.component';
import { DriverPopupComponent } from '../driver-popup/driver-popup.component';
import { HelperPopupComponent } from '../helper-popup/helper-popup.component';
import { UserService } from '../../../profiles/services/user.service';
import { TripService } from '../../../trip-list/services/trip.service';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { DatePipe, NgIf } from '@angular/common';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';

@Component({
  selector: 'app-dialog-data',
  standalone: true,
  imports: [
    MatAutocomplete,
    MatFormField,
    MatOption,
    MatAutocompleteTrigger,
    MatInput,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatIcon,
    MatIconButton,
    MatDialogClose,
    MatSelect,
    NgIf,
    MatError,
  ],
  templateUrl: './dialog-data.component.html',
  styleUrl: './dialog-data.component.scss',
})
export class DialogDataComponent {
  readonly dialog = inject(MatDialog);
  driverSuggestion: any;
  helperSuggestion: any;

  constructor(
    public dialogRef: MatDialogRef<DialogDataComponent>,
    private user: UserService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private trip: TripService,
    private datePipe: DatePipe,
    private toaster: HandleToastrService
  ) {
    this.tripUpdateForm = this.fb.group({
      transporterCode: ['', Validators.required],
      transporterName: ['', Validators.required],
      transporterPhone: ['', Validators.required],
      transporterRate: [''],
      truckId: [''],
      driverCode: [''],
      driverName: [''],
      driverPhone: [''],
      helperCode: [''],
      helperName: [''],
      helperPhone: [''],
      registrationZone: [''],
      registrationCategory: [''],
      registrationSerialNumber: [''],
      registrationNumber: [''],
    });
  }

  transporterSuggestion: any;

  onKeyUpTransporterSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value.length > 0) {
      this.user.getTransporter(0, 100, value).subscribe((res: any) => {
        this.transporterSuggestion = res.data.responses;
      });
    }
  }

  onKeyUpDriverSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value.length > 0) {
      this.user.getDriver(0, 100, value).subscribe((res: any) => {
        this.driverSuggestion = res.data.responses;
      });
    }
  }

  onKeyUpHelperSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value.length > 0) {
      this.user.getHelpers(0, 100, value).subscribe((res: any) => {
        this.helperSuggestion = res.data.responses;
      });
    }
  }

  onClickTransporterSearchSuggestion(option: any) {
    this.tripUpdateForm.get('transporterCode').setValue(option.userId);
    this.tripUpdateForm.get('transporterName').setValue(option.name);
    this.tripUpdateForm.get('transporterPhone').setValue(option.phone);
  }

  onClickDriverSearchSuggestion(option: any) {
    this.tripUpdateForm.get('driverCode').setValue(option.userId);
    this.tripUpdateForm.get('driverName').setValue(option.name);
    this.tripUpdateForm.get('driverPhone').setValue(option.phone);
  }

  onClickHelperSearchSuggestion(option: any) {
    this.tripUpdateForm.get('helperCode').setValue(option.userId);
    this.tripUpdateForm.get('helperName').setValue(option.name);
    this.tripUpdateForm.get('helperPhone').setValue(option.phone);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  protected readonly registrationZoneList = registrationZoneList;
  protected readonly registrationCategoryList = registrationCategoryList;
  tripUpdateForm: FormGroup;

  getTransporterList() {
    const dialogRef = this.dialog
      .open(TransporterPopupComponent, {
        width: '24.125rem',
        height: '52.25rem',
        position: {
          right: '12%',
        },
      })
      .afterClosed()
      .subscribe((transporter: any) => {
        if (transporter) {
          this.tripUpdateForm.get('transporterName').setValue(transporter.name);
          this.tripUpdateForm
            .get('transporterPhone')
            .setValue(transporter.phone);
          this.tripUpdateForm.get('transporterRate').setValue(transporter.rate);
          this.tripUpdateForm
            .get('transporterCode')
            .setValue(transporter.userId);
        } else {
          this.tripUpdateForm.get('transporterName').setValue('');
          this.tripUpdateForm.get('transporterPhone').setValue('');
          this.tripUpdateForm.get('transporterRate').setValue('');
          this.tripUpdateForm.get('transporterCode').setValue('');
        }
      });
  }

  getTruckList() {
    const dialogRef = this.dialog
      .open(TruckPopupComponent, {
        width: '24.125rem',
        height: '52.25rem',
        position: {
          right: '12%',
        },
      })
      .afterClosed()
      .subscribe((truck: any) => {
        if (truck) {
          this.tripUpdateForm.get('truckId').setValue(truck.id);
          this.tripUpdateForm
            .get('registrationZone')
            .setValue(truck.registrationZone);
          this.tripUpdateForm
            .get('registrationCategory')
            .setValue(truck.registrationCategory);
          this.tripUpdateForm
            .get('registrationSerialNumber')
            .setValue(truck.registrationSerial);
          this.tripUpdateForm
            .get('registrationNumber')
            .setValue(truck.registrationNum);
        } else {
          this.tripUpdateForm.get('truckId').setValue('');
          this.tripUpdateForm.get('registrationZone').setValue('');
          this.tripUpdateForm.get('registrationCategory').setValue('');
          this.tripUpdateForm.get('registrationSerialNumber').setValue('');
          this.tripUpdateForm.get('registrationNumber').setValue('');
        }
      });
  }

  getDriverList() {
    const dialogRef = this.dialog
      .open(DriverPopupComponent, {
        width: '24.125rem',
        height: '52.25rem',
        position: {
          right: '12%',
        },
      })
      .afterClosed()
      .subscribe((driver: any) => {
        if (driver) {
          this.tripUpdateForm.get('driverCode').setValue(driver.userId);
          this.tripUpdateForm.get('driverName').setValue(driver.name);
          this.tripUpdateForm.get('driverPhone').setValue(driver.phone);
        } else {
          this.tripUpdateForm.get('driverCode').setValue('');
          this.tripUpdateForm.get('driverName').setValue('');
          this.tripUpdateForm.get('driverPhone').setValue('');
        }
      });
  }

  getHelperList() {
    const dialogRef = this.dialog
      .open(HelperPopupComponent, {
        width: '24.125rem',
        height: '52.25rem',
        position: {
          right: '12%',
        },
      })
      .afterClosed()
      .subscribe((helper: any) => {
        if (helper) {
          this.tripUpdateForm.get('helperCode').setValue(helper.userId);
          this.tripUpdateForm.get('helperName').setValue(helper.name);
          this.tripUpdateForm.get('helperPhone').setValue(helper.phone);
        } else {
          this.tripUpdateForm.get('helperCode').setValue('');
          this.tripUpdateForm.get('helperName').setValue('');
          this.tripUpdateForm.get('helperPhone').setValue('');
        }
      });
  }

  onChangeTripStatus(buttonName: any) {
    if (buttonName === 'Book Trip') {
      if (
        this.tripUpdateForm.get('transporterName').valid &&
        this.tripUpdateForm.get('transporterPhone').valid &&
        this.tripUpdateForm.get('transporterCode').valid
      ) {
        const body: any = {};
        body.transporterCode = this.tripUpdateForm.get('transporterCode').value;
        body.transporterRate = this.tripUpdateForm.get('transporterRate').value;
        body.driverCode = this.tripUpdateForm.get('driverCode').value;
        body.driverName = this.tripUpdateForm.get('driverName').value;
        body.driverPhone = this.tripUpdateForm.get('driverPhone').value;
        body.helperCode = this.tripUpdateForm.get('helperCode').value;
        body.helperName = this.tripUpdateForm.get('helperName').value;
        body.helperPhone = this.tripUpdateForm.get('helperPhone').value;
        body.truckId = this.tripUpdateForm.get('truckId').value;
        this.trip.updateTrip(body, this.data.trip.tripId).subscribe(
          (res: any) => {
            this.dialogRef.close('updated');
            if (res.status == 'OK') {
              this.dialog
                .open(SuccessModalComponent, {
                  width: '21.375rem',
                  data: {
                    title: 'Success',
                    text: this.getBookedText(res.data),
                    buttonText: 'Okay',
                  },
                })
                .afterClosed()
                .subscribe(() => {
                  this.trip.reloadManageTripPage.next(true);
                });
            } else if (res.status == 'BAD REQUEST') {
              this.dialog.open(ErrorModalComponent, {
                width: '21.375rem',
                data: {
                  title: 'Error',
                  text: res.message,
                  buttonText: 'Okay',
                },
              });
            } else {
              this.dialog.open(ErrorModalComponent, {
                width: '21.375rem',
                data: {
                  title: 'Error',
                  text: 'Something went wrong',
                  buttonText: 'Okay',
                },
              });
            }
          },
          error => {
            this.dialog.open(ErrorModalComponent, {
              width: '21.375rem',
              data: {
                title: 'Error',
                text: error.error.message,
                buttonText: 'Okay',
              },
            });
          }
        );
      } else {
        this.tripUpdateForm.markAllAsTouched();
        this.toaster.showError('Please fill all the required fields');
      }
    } else if (buttonName === 'Start Trip') {
      if (this.data?.trip?.truck?.id) {
        this.tripUpdateForm.get('truckId').setValue(this.data.trip.truck.id);
      }
      if (this.data?.trip?.driver?.userId) {
        this.tripUpdateForm
          .get('driverCode')
          .setValue(this.data.trip.driver.userId);
        this.tripUpdateForm
          .get('driverName')
          .setValue(this.data.trip.driver.name);
        this.tripUpdateForm
          .get('driverPhone')
          .setValue(this.data.trip.driver.phone);
      }
      if (
        this.tripUpdateForm.get('driverName').valid &&
        this.tripUpdateForm.get('driverPhone').valid &&
        this.tripUpdateForm.get('driverCode').valid &&
        this.tripUpdateForm.get('truckId').valid
      ) {
        const body: any = {};
        this.tripUpdateForm.get('transporterCode').clearValidators();
        this.tripUpdateForm.get('transporterName').clearValidators();
        this.tripUpdateForm.get('transporterPhone').clearValidators();

        this.tripUpdateForm.get('truckId').setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverCode')
          .setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverName')
          .setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverPhone')
          .setValidators(Validators.required);
        this.tripUpdateForm.get('transporterCode').updateValueAndValidity();
        this.tripUpdateForm.get('transporterName').updateValueAndValidity();
        this.tripUpdateForm.get('transporterPhone').updateValueAndValidity();
        this.tripUpdateForm.get('truckId').updateValueAndValidity();
        this.tripUpdateForm.get('driverCode').updateValueAndValidity();
        this.tripUpdateForm.get('driverName').updateValueAndValidity();
        this.tripUpdateForm.get('driverPhone').updateValueAndValidity();
        if (this.tripUpdateForm.valid) {
          body.driverCode = this.tripUpdateForm.get('driverCode').value;
          body.driverName = this.tripUpdateForm.get('driverName').value;
          body.driverPhone = this.tripUpdateForm.get('driverPhone').value;
          body.helperCode = this.tripUpdateForm.get('helperCode').value;
          body.helperName = this.tripUpdateForm.get('helperName').value;
          body.helperPhone = this.tripUpdateForm.get('helperPhone').value;
          body.truckId = this.tripUpdateForm.get('truckId').value;
          // body.status = 'Running';
          body.tripStartedAt = this.datePipe.transform(
            new Date(),
            'yyyy-MM-dd hh:mm:ss'
          );
          this.trip.updateTrip(body, this.data.trip?.tripId).subscribe(
            (res: any) => {
              if (res.status == 'OK') {
                this.dialogRef.close('updated');
                this.dialog
                  .open(SuccessModalComponent, {
                    width: '21.375rem',
                    data: {
                      title: 'Success',
                      text: `Trip trip has started. Your trip no is ${res.data.tripId}`,
                      buttonText: 'Okay',
                    },
                  })
                  .afterClosed()
                  .subscribe(() => {
                    this.trip.reloadManageTripPage.next(true);
                  });
              } else if (res.status == 'BAD REQUEST') {
                this.dialog.open(ErrorModalComponent, {
                  width: '21.375rem',
                  data: {
                    title: 'Error',
                    text: res.message,
                    buttonText: 'Okay',
                  },
                });
              } else {
                this.dialog.open(ErrorModalComponent, {
                  width: '21.375rem',
                  data: {
                    title: 'Error',
                    text: 'Something went wrong',
                    buttonText: 'Okay',
                  },
                });
              }
            },
            error => {
              this.dialog.open(ErrorModalComponent, {
                width: '21.375rem',
                data: {
                  title: 'Error',
                  text: error.error.message,
                  buttonText: 'Okay',
                },
              });
            }
          );
        } else {
          this.tripUpdateForm.markAllAsTouched();
          this.toaster.showError('Please fill all the required fields');
        }
      }
    } else if (buttonName.includes('Assign')) {
      this.tripUpdateForm.get('transporterCode').clearValidators();
      this.tripUpdateForm.get('transporterName').clearValidators();
      this.tripUpdateForm.get('transporterPhone').clearValidators();
      if (buttonName === 'Assign Truck') {
        this.tripUpdateForm.get('truckId').setValidators(Validators.required);
        this.tripUpdateForm.get('driverCode').clearValidators();
        this.tripUpdateForm.get('driverName').clearValidators();
        this.tripUpdateForm.get('driverPhone').clearValidators();
      } else if (buttonName === 'Assign Driver') {
        this.tripUpdateForm.get('truckId').clearValidators();
        this.tripUpdateForm
          .get('driverCode')
          .setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverName')
          .setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverPhone')
          .setValidators(Validators.required);
      } else {
        this.tripUpdateForm.get('truckId').setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverCode')
          .setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverName')
          .setValidators(Validators.required);
        this.tripUpdateForm
          .get('driverPhone')
          .setValidators(Validators.required);
        this.tripUpdateForm.get('transporterCode').updateValueAndValidity();
        this.tripUpdateForm.get('transporterName').updateValueAndValidity();
        this.tripUpdateForm.get('transporterPhone').updateValueAndValidity();
        this.tripUpdateForm.get('truckId').updateValueAndValidity();
        this.tripUpdateForm.get('driverCode').updateValueAndValidity();
        this.tripUpdateForm.get('driverName').updateValueAndValidity();
        this.tripUpdateForm.get('driverPhone').updateValueAndValidity();
        if (
          this.tripUpdateForm.get('truckId').valid ||
          this.tripUpdateForm.get('driverCode').valid
        ) {
          this.tripUpdateForm.get('truckId').clearValidators();
          this.tripUpdateForm.get('driverCode').clearValidators();
          this.tripUpdateForm.get('driverName').clearValidators();
          this.tripUpdateForm.get('driverPhone').clearValidators();
        } else {
          this.tripUpdateForm.get('truckId').setValidators(Validators.required);
          this.tripUpdateForm
            .get('driverCode')
            .setValidators(Validators.required);
          this.tripUpdateForm
            .get('driverName')
            .setValidators(Validators.required);
          this.tripUpdateForm
            .get('driverPhone')
            .setValidators(Validators.required);
        }
      }
      this.tripUpdateForm.get('transporterCode').updateValueAndValidity();
      this.tripUpdateForm.get('transporterName').updateValueAndValidity();
      this.tripUpdateForm.get('transporterPhone').updateValueAndValidity();
      this.tripUpdateForm.get('truckId').updateValueAndValidity();
      this.tripUpdateForm.get('driverCode').updateValueAndValidity();
      this.tripUpdateForm.get('driverName').updateValueAndValidity();
      this.tripUpdateForm.get('driverPhone').updateValueAndValidity();
      if (this.tripUpdateForm.valid) {
        const body: any = {};
        body.driverCode = this.tripUpdateForm.get('driverCode').value;
        body.driverName = this.tripUpdateForm.get('driverName').value;
        body.driverPhone = this.tripUpdateForm.get('driverPhone').value;
        body.helperCode = this.tripUpdateForm.get('helperCode').value;
        body.helperName = this.tripUpdateForm.get('helperName').value;
        body.helperPhone = this.tripUpdateForm.get('helperPhone').value;
        body.truckId = this.tripUpdateForm.get('truckId').value;
        this.trip.updateTrip(body, this.data.trip.tripId).subscribe(
          (res: any) => {
            if (res.status == 'OK') {
              this.dialogRef.close('updated');
              this.dialog
                .open(SuccessModalComponent, {
                  width: '21.375rem',
                  data: {
                    title: 'Success',
                    text: this.getAssignedText(res.data),
                    buttonText: 'Okay',
                  },
                })
                .afterClosed()
                .subscribe(() => {
                  this.trip.reloadManageTripPage.next(true);
                });
            } else if (res.status == 'BAD REQUEST') {
              this.dialog.open(ErrorModalComponent, {
                width: '21.375rem',
                data: {
                  title: 'Error',
                  text: res.message,
                  buttonText: 'Okay',
                },
              });
            } else {
              this.dialog.open(ErrorModalComponent, {
                width: '21.375rem',
                data: {
                  title: 'Error',
                  text: 'Something went wrong',
                  buttonText: 'Okay',
                },
              });
            }
          },
          error => {
            this.dialog.open(ErrorModalComponent, {
              width: '21.375rem',
              data: {
                title: 'Error',
                text: error.error.message,
                buttonText: 'Okay',
              },
            });
          }
        );
      } else {
        this.tripUpdateForm.markAllAsTouched();
        this.toaster.showError('Please fill all the required fields');
      }
    }
  }

  ngOnInit() {
    this.updateFormWithTripData();
  }

  private updateFormWithTripData() {
    if (this.data.trip) {
      this.tripUpdateForm
        .get('transporterName')
        .setValue(
          this.data.trip.transporterName ? this.data.trip.transporterName : ''
        );
      this.tripUpdateForm
        .get('transporterPhone')
        .setValue(
          this.data.trip.transporterPhone ? this.data.trip.transporterPhone : ''
        );
      this.tripUpdateForm
        .get('transporterRate')
        .setValue(
          this.data.trip.transporterRate ? this.data.trip.transporterRate : ''
        );
      this.tripUpdateForm
        .get('transporterCode')
        .setValue(
          this.data.trip.transporterCode ? this.data.trip.transporterCode : ''
        );
      this.tripUpdateForm
        .get('truckId')
        .setValue(this.data.trip.truckId ? this.data.trip.truckId : '');
      this.tripUpdateForm
        .get('driverCode')
        .setValue(this.data.trip.driverCode ? this.data.trip.driverCode : '');
      this.tripUpdateForm
        .get('driverName')
        .setValue(this.data.trip.driverName ? this.data.trip.driverName : '');
      this.tripUpdateForm
        .get('driverPhone')
        .setValue(this.data.trip.driverPhone ? this.data.trip.driverPhone : '');
      this.tripUpdateForm
        .get('helperCode')
        .setValue(this.data.trip.helperCode ? this.data.trip.helperCode : '');
      this.tripUpdateForm
        .get('helperName')
        .setValue(this.data.trip.helperName ? this.data.trip.helperName : '');
      this.tripUpdateForm
        .get('helperPhone')
        .setValue(this.data.trip.helperPhone ? this.data.trip.helperPhone : '');
      this.tripUpdateForm
        .get('registrationZone')
        .setValue(
          this.data.trip.registrationZone ? this.data.trip.registrationZone : ''
        );
      this.tripUpdateForm
        .get('registrationCategory')
        .setValue(
          this.data.trip.registrationCategory
            ? this.data.trip.registrationCategory
            : ''
        );
      this.tripUpdateForm
        .get('registrationSerialNumber')
        .setValue(
          this.data.trip.registrationSerialNumber
            ? this.data.trip.registrationSerialNumber
            : ''
        );
      this.tripUpdateForm
        .get('registrationNumber')
        .setValue(
          this.data.trip.registrationNumber
            ? this.data.trip.registrationNumber
            : ''
        );
    }
  }

  getButtonName() {
    return this.data.buttonName;
  }

  private getBookedText(res: any) {
    let text = '';
    if (
      res.transporterCode &&
      !res.driverCode &&
      !res.helperCode &&
      !res.truck?.id
    ) {
      text += `Transporter: ${res.transporterName}`;
    } else if (res.driverCode && !res.helperCode && !res.truck?.id) {
      text += `Driver: ${res.driverName}`;
    } else if (res.helperCode && !res.driverCode && !res.truck?.id) {
      text += `Helper: ${res.helperName}`;
    } else if (res.truck?.id && !res.driverCode && !res.helperCode) {
      text += `Truck: ${res.truck?.fullRegistrationNumber}`;
    } else if (
      res.transporterCode &&
      res.truck?.id &&
      !res.driverCode &&
      !res.helperCode
    ) {
      text += `Transporter: ${res.transporterName}, Driver: ${res.truck?.fullRegistrationNumber}`;
    } else if (
      res.transporterCode &&
      res.driverCode &&
      !res.helperCode &&
      !res.truck?.id
    ) {
      text += `Transporter: ${res.transporterName}, Driver: ${res.driverName}`;
    } else if (
      res.transporterCode &&
      res.helperCode &&
      !res.driverCode &&
      !res.truck?.id
    ) {
      text += `Transporter: ${res.transporterName}, Helper: ${res.helperName}`;
    } else if (
      res.transporterCode &&
      res.truck?.id &&
      res.driverCode &&
      !res.helperCode
    ) {
      text += `Transporter: ${res.transporterName}, Truck: ${res.truck?.fullRegistrationNumber},, Driver: ${res.driverName}`;
    } else if (
      res.transporterCode &&
      res.truck?.id &&
      res.helperCode &&
      !res.driverCode
    ) {
      text += `Transporter: ${res.transporterName}, Truck: ${res.truck?.fullRegistrationNumber}, Helper: ${res.helperName}`;
    } else if (
      res.transporterCode &&
      res.driverCode &&
      res.helperCode &&
      !res.truck?.id
    ) {
      text += `Transporter: ${res.transporterName}, Driver: ${res.driverName}, Helper: ${res.helperName}`;
    } else if (
      res.transporterCode &&
      res.truck?.id &&
      res.driverCode &&
      res.helperCode
    ) {
      text += `Transporter: ${res.transporterName}, Truck: ${res.truck?.fullRegistrationNumber}, Driver: ${res.driverName}, Helper: ${res.helperName}`;
    } else {
      text += `Transporter: ${res.transporterName}, Truck: ${res.truck?.fullRegistrationNumber}, Driver: ${res.driverName}, Helper: ${res.helperName}`;
    }
    return text + ' have been assigned to trip ' + res.tripId;
  }

  private getAssignedText(res) {
    let text = '';
    if (res.driverCode && res.truck?.id && res.helperCode) {
      text += ` Truck: ${res.truck?.fullRegistrationNumber}, Driver: ${res.driverName}, Helper: ${res.helperName} have been assigned to trip ${res.tripId}`;
    } else if (res.driverCode && res.truck?.id && !res.helperCode) {
      text += ` Truck: ${res.truck?.fullRegistrationNumber}, Driver: ${res.driverName} have been assigned to trip ${res.tripId}`;
    } else if (res.driverCode && res.helperCode && !res.truck?.id) {
      text += ` Driver: ${res.driverName}, Helper: ${res.helperName} have been assigned to trip ${res.tripId}`;
    } else if (res.truck?.id && res.helperCode && !res.driverCode) {
      text += ` Truck: ${res.truck?.fullRegistrationNumber}, Helper: ${res.helperName} have been assigned to trip ${res.tripId}`;
    } else if (res.truck?.id && !res.driverCode && !res.helperCode) {
      text += ` Truck: ${res.truck?.fullRegistrationNumber} have been assigned to trip ${res.tripId}`;
    } else if (res.driverCode && !res.truck?.id && !res.helperCode) {
      text += ` Driver: ${res.driverName} have been assigned to trip ${res.tripId}`;
    } else if (res.helperCode && !res.truck?.id && !res.driverCode) {
      text += ` Helper: ${res.helperName} have been assigned to trip ${res.tripId}`;
    } else {
      text += ` Truck: ${res.truck?.fullRegistrationNumber}, Driver: ${res.driverName}, Helper: ${res.helperName} have been assigned to trip ${res.tripId}`;
    }
    return text;
  }
}
