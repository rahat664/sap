import { Component, inject, Input, OnInit } from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { MyErrorStateMatcher } from '../template-create/template-create.component';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TripService } from '../../services/trip.service';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';
import { Router } from '@angular/router';
import {
  MatError,
  MatFormField,
  MatSuffix,
} from '@angular/material/form-field';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { ScrollByButtonDirective } from '../../../../shared/directive/scroll-by-button.directive';
import { TransporterPopupComponent } from '../../../manage-trip/components/transporter-popup/transporter-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { DriverPopupComponent } from '../../../manage-trip/components/driver-popup/driver-popup.component';
import { HelperPopupComponent } from '../../../manage-trip/components/helper-popup/helper-popup.component';
import { TruckPopupComponent } from '../../../manage-trip/components/truck-popup/truck-popup.component';
import { UserService } from '../../../profiles/services/user.service';
import { ConfirmUpdateComponent } from '../../../manage-trip/components/confirm-update/confirm-update.component';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';
import { MatCalendar, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatCard } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { TimePickerComponent } from '../../../../shared/modules/time-picker/time-picker.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { paymentType, paymentTypes, tripType, tripTypes } from '../../../auth/models/response/trip';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';

@Component({
  selector: 'app-trip-update',
  imports: [
    MatAutocomplete,
    ReactiveFormsModule,
    MatFormField,
    MatMenuTrigger,
    MatButton,
    MatInput,
    MatAutocompleteTrigger,
    MatOption,
    ScrollByButtonDirective,
    NgClass,
    NgForOf,
    NgIf,
    MatError,
    MatCalendar,
    MatCard,
    MatDatepickerToggle,
    MatMenu,
    MatSuffix,
    MatTooltip,
    TimePickerComponent,
    FallbackImagePipe,
    ImageErrorDirective,
    CustomInputComponent,
    GetClickEventDirective,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './trip-update.component.html',
  styleUrl: './trip-update.component.scss',
})
export class TripUpdateComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  goodsOptionsArray: CustomInputSelectModel[] = [];
  matcher = new MyErrorStateMatcher();
  tripUpdateForm: FormGroup;
  district: any;
  @Input() template: any;
  @Input() customerName: string;
  @Input() templateEnabled = false;
  vehicleTypeList: any;
  truckCapacitySuggestions: any[];
  truckSizeSuggestions: any[];
  loadingSuggestions: any;
  unloadingSuggestions: any;
  loadingGoodsSuggestions: any;
  numberOfTrucksSuggestions: any;
  isFromTemplate = false;
  driverSuggestion: any;
  transporterSuggestion: any;

  constructor(
    private service: TripService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private locationService: GeolocationService,
    private router: Router,
    private user: UserService
  ) {}

  onUpdateTrip() {
    const tripData = JSON.parse(localStorage.getItem('updateTripDetails'));
    const tripId = localStorage.getItem('tripId');
    if (this.tripUpdateForm.valid) {
      const dialogRef = this.dialog
        .open(ConfirmUpdateComponent, {
          width: '22rem',
          data: {
            title: 'Update Trip',
            text: 'Are you sure you want to update this trip?',
            buttonText: 'Update',
          },
        })
        .afterClosed()
        .subscribe((res: boolean) => {
          if (res) {
            const body = {
              tripStartDatetime: this.datePipe.transform(
                new Date(this.tripUpdateForm.get('tripStartDatetime').value),
                'yyyy-MM-ddTHH:mm:ss'
              ),
              categoryId: this.tripUpdateForm.get('categoryId').value,
              numOfTrucks: this.tripUpdateForm.get('numOfTrucks').value,
              truckSize: this.tripUpdateForm.get('truckSize').value,
              truckCapacityInTon:
                this.tripUpdateForm.get('truckCapacityInTon').value,
              goodsId: this.tripUpdateForm.get('goodsId').value,
              goodsName: this.tripUpdateForm.get('goodsName').value,
              customerRate: this.tripUpdateForm.get('customerRate').value,
              note: this.tripUpdateForm.get('note').value,
              paymentType: this.tripUpdateForm.get('paymentType').value,
              tripType: this.tripUpdateForm.get('tripType').value,
              points: [
                ...this.tripUpdateForm.get('loadingPoints').value,
                ...this.tripUpdateForm.get('unloadingPoints').value,
              ],
            };

            if (this.truckSourcePlaceholder ) {
              body['sourceOfTruck'] = this.truckSourcePlaceholder;
            }
            if (
              this.tripUpdateForm.get('truckId').value &&
              this.tripUpdateForm.get('truckId').value !== tripData.truck?.id
            ) {
              body['truckId'] = this.tripUpdateForm.get('truckId').value;
            }
            if (
              this.tripUpdateForm.get('transporterCode').value &&
              this.tripUpdateForm.get('transporterCode').value !==
                tripData.transporterCode
            ) {
              body['transporterCode'] =
                this.tripUpdateForm.get('transporterCode').value;
            }
            if (
              this.tripUpdateForm.get('transporterName').value &&
              this.tripUpdateForm.get('transporterName').value !==
                tripData.transporterName
            ) {
              body['transporterName'] =
                this.tripUpdateForm.get('transporterName').value;
            }
            if (
              this.tripUpdateForm.get('transporterPhone').value &&
              this.tripUpdateForm.get('transporterPhone').value !==
                tripData.transporterPhone
            ) {
              body['transporterPhone'] =
                this.tripUpdateForm.get('transporterPhone').value;
            }

            if (
              this.tripUpdateForm.get('transporterRate').value &&
              this.tripUpdateForm.get('transporterRate').value !==
                tripData.transporterRate
            ) {
              body['transporterRate'] =
                this.tripUpdateForm.get('transporterRate').value;
            }

            if (
              this.tripUpdateForm.get('driverCode').value &&
              this.tripUpdateForm.get('driverCode').value !==
                tripData.driverCode
            ) {
              body['driverCode'] = this.tripUpdateForm.get('driverCode').value;
            }
            if (
              this.tripUpdateForm.get('driverName').value &&
              this.tripUpdateForm.get('driverName').value !==
                tripData.driverName
            ) {
              body['driverName'] = this.tripUpdateForm.get('driverName').value;
            }
            if (
              this.tripUpdateForm.get('driverPhone').value &&
              this.tripUpdateForm.get('driverPhone').value !==
                tripData.driverPhone
            ) {
              body['driverPhone'] =
                this.tripUpdateForm.get('driverPhone').value;
            }
            if (
              this.tripUpdateForm.get('helperCode').value &&
              this.tripUpdateForm.get('helperCode').value !==
                tripData.helperCode
            ) {
              body['helperCode'] = this.tripUpdateForm.get('helperCode').value;
            }
            if (
              this.tripUpdateForm.get('helperName').value &&
              this.tripUpdateForm.get('helperName').value !==
                tripData.helperName
            ) {
              body['helperName'] = this.tripUpdateForm.get('helperName').value;
            }
            if (
              this.tripUpdateForm.get('helperPhone').value &&
              this.tripUpdateForm.get('helperPhone').value !==
                tripData.helperPhone
            ) {
              body['helperPhone'] =
                this.tripUpdateForm.get('helperPhone').value;
            }
            this.service.updateTrip(body, tripId).subscribe(
              (res: any) => {
                if (res.status == 'OK') {
                  this.dialog
                    .open(SuccessModalComponent, {
                      width: '21.375rem',
                      data: {
                        title: 'Success',
                        text: `Trip ${res.data.tripId} updated successfully`,
                        buttonText: 'Okay',
                      },
                    })
                    .afterClosed()
                    .subscribe(() => {
                      this.router.navigateByUrl('/manage-trip');
                      this.service.reloadManageTripPage.next(true);
                    });
                } else if (res.status == 'Bad Request') {
                  this.dialog.open(ErrorModalComponent, {
                    width: '21.375rem',
                    data: {
                      title: 'Error',
                      text: res.message,
                      buttonText: 'Okay',
                    },
                  });
                }
              },
              err => {
                this.dialog.open(ErrorModalComponent, {
                  width: '21.375rem',
                  data: {
                    title: 'Error',
                    text: err.error.message,
                    buttonText: 'Okay',
                  },
                });
              }
            );
          }
        });
    }
  }

  scrollable = false;
  rightButtonClicked = false;
  leftButtonClicked = false;

  onClickLeftButton() {
    this.leftButtonClicked = true;
    this.rightButtonClicked = false;
  }

  onClickRightButton() {
    this.rightButtonClicked = true;
    this.leftButtonClicked = false;
  }

  ngOnInit(): void {
    this.getDistricts();
    this.getVehicleTypeList();
    this.getGoodsOptions();
    this.getCachedData();
    this.initializeForm();
    this.getValueFromTripDetails();
  }

  private getVehicleTypeList() {
    this.service.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
      if (JSON.parse(localStorage.getItem('updateTripDetails'))) {
        const selectedTemplate = JSON.parse(
          localStorage.getItem('updateTripDetails')
        );
        this.vehicleTypeList.forEach((element: any) => {
          if (element.id == selectedTemplate.vehicleCategory.id) {
            element.selected = true;
          }
        });
      }
    });
  }

  onVehicleTypeClick(item: any) {
    this.tripUpdateForm.get('categoryId').setValue(item.id);
    this.vehicleTypeList.forEach((element: any) => {
      element.selected = false;
    });
    item.selected = true;
  }

  loadingDistrictSuggestions: any;
  unloadingDistrictSuggestions: any;
  selectedCustomer: any;
  helperSuggestion: any;
  readonly minDate = new Date();
  selectedDate: Date = new Date();
  returnToInputDate: Date;
  isDisabled = false;

  private getGoodsOptions() {
    this.service.getGoodsOptions().subscribe((res: any) => {
      res.data.forEach((element: any) => {
        this.goodsOptionsArray.push({
          id: element.id,
          value: element.name,
          selected: false,
        });
      });
    });
  }

  private getCachedData() {
    const cachedTruckSize = [
      {
        value: 5,
        selected: false,
      },
      {
        value: 10,
        selected: false,
      },
      {
        value: 12,
        selected: false,
      },
      {
        value: 12.5,
        selected: false,
      },
      {
        value: 13,
        selected: false,
      },
    ];
    const cachedTruckCapacity = [
      {
        value: 5,
        selected: false,
      },
      {
        value: 10,
        selected: false,
      },
      {
        value: 12,
        selected: false,
      },
      {
        value: 12.5,
        selected: false,
      },
      {
        value: 13,
        selected: false,
      },
    ];
    const cachedNoOfTrucks = [
      {
        value: 1,
        selected: false,
      },
      {
        value: 2,
        selected: false,
      },
      {
        value: 5,
        selected: false,
      },
      {
        value: 10,
        selected: false,
      },
      {
        value: 50,
        selected: false,
      },
    ];
    if (localStorage.getItem('noOfTrucks')) {
      this.numberOfTrucksSuggestions = JSON.parse(
        localStorage.getItem('noOfTrucks')
      );
    } else {
      this.numberOfTrucksSuggestions = cachedNoOfTrucks;
      localStorage.setItem('noOfTrucks', JSON.stringify(cachedNoOfTrucks));
    }
    if (localStorage.getItem('truckSize')) {
      this.truckSizeSuggestions = JSON.parse(localStorage.getItem('truckSize'));
    } else {
      this.truckSizeSuggestions = cachedTruckSize;
      localStorage.setItem('truckSize', JSON.stringify(cachedTruckSize));
    }
    if (localStorage.getItem('truckCapacity')) {
      this.truckCapacitySuggestions = JSON.parse(
        localStorage.getItem('truckCapacity')
      );
    } else {
      this.truckCapacitySuggestions = cachedTruckCapacity;
      localStorage.setItem(
        'truckCapacity',
        JSON.stringify(cachedTruckCapacity)
      );
    }
  }

  onClickTruckCapacitySuggestions(suggestion: any) {
    this.tripUpdateForm.get('truckCapacityInTon').setValue(suggestion.value);
    this.truckCapacitySuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckCapacity.next(this.truckCapacitySuggestions);
  }

  onClickTruckSizeSuggestions(suggestion: any) {
    this.tripUpdateForm.get('truckSize').setValue(suggestion.value);
    this.truckSizeSuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckSize.next(this.truckSizeSuggestions);
  }

  private initializeForm() {
    this.tripUpdateForm = this.fb.group({
      tripStartDatetime: [''],
      categoryId: [''],
      numOfTrucks: [''],
      truckSize: [''],
      truckCapacityInTon: [''],
      goodsId: [''],
      goodsName: [''],
      paymentType: [''],
      tripType: [''],
      customerRate: [null],
      note: [''],
      source: [''],
      loadingPoints: this.fb.array([this.createLoadingPoint()]),
      unloadingPoints: this.fb.array([this.createUnloadingPoint()]),
      transporterCode: [''],
      transporterName: [''],
      transporterPhone: [''],
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

  private createLoadingPoint() {
    return this.fb.group({
      id: [''],
      pointDistrict: ['', Validators.required],
      pointName: ['', Validators.required],
      pointLat: ['', Validators.required],
      pointLon: ['', Validators.required],
      pointType: ['Loading'],
    });
  }

  private createUnloadingPoint() {
    return this.fb.group({
      id: [''],
      pointDistrict: ['', Validators.required],
      pointName: ['', Validators.required],
      pointLat: ['', Validators.required],
      pointLon: ['', Validators.required],
      pointType: ['Unloading'],
    });
  }

  addLoadingPoint() {
    this.loadingPoints.push(this.createLoadingPoint());
  }

  get loadingPoints() {
    return this.tripUpdateForm.get('loadingPoints') as FormArray;
  }

  addUnloadingPoint() {
    this.unloadingPoints.push(this.createUnloadingPoint());
  }

  get unloadingPoints() {
    return this.tripUpdateForm.get('unloadingPoints') as FormArray;
  }

  removeLoadingPoint(index: number) {
    this.loadingPoints.removeAt(index);
  }

  removeUnloadingPoint(index: number) {
    this.unloadingPoints.removeAt(index);
  }

  onKeyUpLoadingPoint($event: KeyboardEvent, i: number) {
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.service
        .getLocationSuggestions(target.value, target.value)
        .subscribe((res: any) => {
          this.loadingSuggestions = res.data;
        });
    } else {
      this.loadingSuggestions = [];

      this.loadingPoints?.controls[i]?.get('pointDistrict').enable();
      this.loadingPoints?.controls[i]?.get('pointDistrict').setValue('');
      this.loadingPoints?.controls[i]?.get('pointLat').setValue('');
      this.loadingPoints?.controls[i]?.get('pointLon').setValue('');
    }
  }

  onKeyUpTransporterSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value.length > 0) {
      this.user.getTransporter(0, 100, value).subscribe((res: any) => {
        this.transporterSuggestion = res.data;
      });
    }
  }

  onClickLoadingSuggestion(option: any, i: number) {
    // update above functionality with form array
    option?.locationPointName
      ? this.loadingPoints?.controls[i]
          ?.get('pointName')
          .setValue(option.locationPointName)
      : this.loadingPoints?.controls[i]
          ?.get('pointName')
          .setValue(option.addressText);
    if (option.district) {
      this.loadingPoints?.controls[i]?.get('pointDistrict').setValue('');
      this.loadingPoints?.controls[i]
        ?.get('pointDistrict')
        .setValue(option.district);
    } else {
      for (
        let singleDistrict = 0;
        singleDistrict < this.district.length;
        singleDistrict++
      ) {
        if (option.addressText.includes(this.district[singleDistrict].name)) {
          this.loadingPoints?.controls[i]
            ?.get('pointDistrict')
            .setValue(this.district[singleDistrict].name);
          break;
        } else {
          this.loadingPoints?.controls[i]?.get('pointDistrict').enable();
        }
      }
    }

    if (option.latitude > 0 && option.longitude > 0) {
      this.loadingPoints?.controls[i]
        ?.get('pointLat')
        .setValue(option.latitude);
      this.loadingPoints?.controls[i]
        ?.get('pointLon')
        .setValue(option.longitude);
    } else {
      this.locationService.getLatLong(option.placeId).subscribe((res: any) => {
        const lat = res.location.latitude;
        const lng = res.location.longitude;
        this.loadingPoints?.controls[i]?.get('pointLat').setValue(lat);
        this.loadingPoints?.controls[i]?.get('pointLon').setValue(lng);
      });
    }
    this.loadingSuggestions = [];
  }

  onClickUnloadingSuggestion(option: any, i: number) {
    this.unloadingPoints?.controls[i]
      ?.get('pointName')
      .setValue(
        option.locationPointName ? option.locationPointName : option.addressText
      );
    if (option.district) {
      this.unloadingPoints?.controls[i]?.get('pointDistrict').setValue('');
      this.unloadingPoints?.controls[i]
        ?.get('pointDistrict')
        .setValue(option.district);
    } else {
      for (
        let singleDistrict = 0;
        singleDistrict < this.district.length;
        singleDistrict++
      ) {
        if (option.addressText.includes(this.district[singleDistrict].name)) {
          this.unloadingPoints?.controls[i]
            ?.get('pointDistrict')
            .setValue(this.district[singleDistrict].name);
          break;
        } else {
          this.unloadingPoints?.controls[i]?.get('pointDistrict').enable();
        }
      }
    }
    if (option.latitude > 0 && option.longitude > 0) {
      this.unloadingPoints?.controls[i]
        ?.get('pointLat')
        .setValue(option.latitude);
      this.unloadingPoints?.controls[i]
        ?.get('pointLon')
        .setValue(option.longitude);
    } else {
      this.locationService.getLatLong(option.placeId).subscribe((res: any) => {
        this.unloadingPoints?.controls[i]
          ?.get('pointLat')
          .setValue(res?.location?.latitude);
        this.unloadingPoints?.controls[i]
          ?.get('pointLon')
          .setValue(res?.location?.longitude);
      });
    }
    this.unloadingSuggestions = [];
  }

  onKeyUpUnloadingPoint($event: KeyboardEvent, i: number) {
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.service
        .getLocationSuggestions(target.value, target.value)
        .subscribe((res: any) => {
          this.unloadingSuggestions = res.data;
        });
    } else {
      this.unloadingSuggestions = [];

      this.unloadingPoints?.controls[i]?.get('pointDistrict').enable();
      this.unloadingPoints?.controls[i]?.get('pointDistrict').setValue('');
      this.unloadingPoints?.controls[i]?.get('pointLat').setValue('');
      this.unloadingPoints?.controls[i]?.get('pointLon').setValue('');
    }
  }

  onKeyUpLoadingDistrict($event: KeyboardEvent, i: number) {
    const districts = JSON.parse(JSON.stringify(this.district));
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.loadingDistrictSuggestions = districts.filter((district: any) =>
        district.name.toLowerCase().includes(target.value.toLowerCase())
      );
    } else {
      this.loadingDistrictSuggestions = [];
    }
  }

  onSelectLoadingDistrict(option: any, i: number) {
    this.loadingPoints?.controls[i]?.get('pointDistrict').setValue(option.name);
    if (
      this.loadingPoints?.controls[i]?.get('pointLat').value === '' ||
      this.loadingPoints?.controls[i]?.get('pointLon').value === ''
    ) {
      this.loadingPoints?.controls[i]
        ?.get('pointLat')
        .setValue(
          this.loadingPoints?.controls[i]?.get('pointLat').value
            ? this.loadingPoints?.controls[i]?.get('pointLat').value
            : option.lat
        );
      this.loadingPoints?.controls[i]
        ?.get('pointLon')
        .setValue(
          this.loadingPoints?.controls[i]?.get('pointLon').value
            ? this.loadingPoints?.controls[i]?.get('pointLon').value
            : option.lon
        );
    }
    this.loadingDistrictSuggestions = [];
  }

  onKeyUpUnloadingDistrict($event: KeyboardEvent, i: number) {
    const districts = JSON.parse(JSON.stringify(this.district));
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.unloadingDistrictSuggestions = districts.filter((district: any) =>
        district.name.toLowerCase().includes(target.value.toLowerCase())
      );
    } else {
      this.unloadingDistrictSuggestions = [];
    }
  }

  onSelectUnloadingDistrict(option: any, i: number) {
    this.unloadingPoints?.controls[i]
      ?.get('pointDistrict')
      .setValue(option.name);
    if (
      this.unloadingPoints?.controls[i]?.get('pointLat').value === '' ||
      this.unloadingPoints?.controls[i]?.get('pointLon').value === ''
    ) {
      this.unloadingPoints?.controls[i].setValue(
        this.unloadingPoints?.controls[i]?.get('pointLat').value
          ? this.unloadingPoints?.controls[i]?.get('pointLat').value
          : option.lat
      );
      this.unloadingPoints?.controls[i].setValue(
        this.unloadingPoints?.controls[i]?.get('pointLon').value
          ? this.unloadingPoints?.controls[i]?.get('pointLon').value
          : option.lon
      );
    }
    this.unloadingDistrictSuggestions = [];
  }

  onClickGoodsSuggestion(option: CustomInputSelectModel) {
    this.tripUpdateForm.get('goodsId').setValue(option.id);
    this.tripUpdateForm.get('goodsName').setValue(option.value);
  }

  onKeyUpGoods($event: KeyboardEvent) {
    const target = $event.target as HTMLInputElement;
    const goodsOptions = JSON.parse(JSON.stringify(this.goodsOptionsArray));
    if (target.value.length > 1) {
      this.loadingGoodsSuggestions = goodsOptions.filter((option: any) =>
        option.value.toLowerCase().includes(target.value.toLowerCase())
      );
      if (this.loadingGoodsSuggestions.length === 0) {
        this.tripUpdateForm.get('goodsId').setValue('');
        this.tripUpdateForm.get('goodsName').setValue(target.value);
        this.tripUpdateForm.get('goodsName').updateValueAndValidity();
        this.tripUpdateForm.get('goodsId').updateValueAndValidity();
      }
    } else {
      this.loadingGoodsSuggestions = [];
    }
  }

  onClickNoOfTruckSuggestion(suggestion: any) {
    this.tripUpdateForm.get('numOfTrucks').setValue(suggestion.value);
    this.numberOfTrucksSuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
  }

  private checkCacheDataAndUpdate(
    numOfTrucks: string,
    truckSize: string,
    truckCapacityInTon: string
  ) {
    const noOfTrucks = JSON.parse(localStorage.getItem('noOfTrucks'));
    const truckSizeSuggestions = JSON.parse(localStorage.getItem('truckSize'));
    const truckCapacitySuggestions = JSON.parse(
      localStorage.getItem('truckCapacity')
    );
    const findNumOfTrucks = noOfTrucks.find(
      (suggestion: any) => suggestion.value === numOfTrucks
    );
    const findTruckSize = truckSizeSuggestions.find(
      (suggestion: any) => suggestion.value === truckSize
    );
    const findTruckCapacity = truckCapacitySuggestions.find(
      (suggestion: any) => suggestion.value === truckCapacityInTon
    );

    if (!findNumOfTrucks) {
      //remove the last element and add the new element to index 0
      noOfTrucks.pop();
      noOfTrucks.unshift({ value: numOfTrucks, selected: false });
      localStorage.setItem('noOfTrucks', JSON.stringify(noOfTrucks));
    }
    if (!findTruckSize) {
      truckSizeSuggestions.pop();
      truckSizeSuggestions.unshift({ value: truckSize, selected: false });
      localStorage.setItem('truckSize', JSON.stringify(truckSizeSuggestions));
    }
    if (!findTruckCapacity) {
      truckCapacitySuggestions.pop();
      truckCapacitySuggestions.unshift({
        value: truckCapacityInTon,
        selected: false,
      });
      localStorage.setItem(
        'truckCapacity',
        JSON.stringify(truckCapacitySuggestions)
      );
    }
  }

  private getDistricts() {
    this.service.getDistricts().subscribe((res: any) => {
      this.district = res.data;
    });
  }

  getTransporterList() {
    const dialogRef = this.dialog
      .open(TransporterPopupComponent, {
        width: '24.125rem',
        height: '52.25rem',
      })
      .afterClosed()
      .subscribe((transporter: any) => {
        if (transporter) {
          this.tripUpdateForm.get('transporterName').setValue(transporter.name);
          this.tripUpdateForm
            .get('transporterPhone')
            .setValue(transporter.contactPersonNumber);
          this.tripUpdateForm.get('transporterRate').setValue(transporter.rate);
          this.tripUpdateForm.get('transporterCode').setValue(transporter.code);
        } else {
        }
      });
  }

  getDriverList() {
    const dialogRef = this.dialog
      .open(DriverPopupComponent, {
        width: '24.125rem',
        height: '52.25rem',
      })
      .afterClosed()
      .subscribe((driver: any) => {
        if (driver) {
          this.tripUpdateForm.get('driverCode').setValue(driver.userId);
          this.tripUpdateForm.get('driverName').setValue(driver.name);
          this.tripUpdateForm.get('driverPhone').setValue(driver.phone);
        } else {
        }
      });
  }

  onKeyUpDriverSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value.length > 0) {
      this.user.getDriver(0, 100, value).subscribe((res: any) => {
        this.driverSuggestion = res.data.responses;
      });
    }
  }

  getTruckList() {
    const dialogRef = this.dialog
      .open(TruckPopupComponent, {
        width: '24.125rem',
        height: '52.25rem',
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
        }
      });
  }

  onClickTransporterSearchSuggestion(option: any) {
    this.tripUpdateForm.get('transporterName').setValue(option.name);
    this.tripUpdateForm
      .get('transporterPhone')
      .setValue(option.contactPersonNumber);
    this.tripUpdateForm.get('transporterCode').setValue(option.code);
  }

  onClickDriverSearchSuggestion(option: any) {
    this.tripUpdateForm.get('driverName').setValue(option.name);
    this.tripUpdateForm.get('driverPhone').setValue(option.phone);
  }

  private getValueFromTripDetails() {
    const tripData = JSON.parse(localStorage.getItem('updateTripDetails'));
    if (tripData) {
      this.tripStatus = tripData.status;
      this.customerName = tripData.customerName;
      this.tripUpdateForm
        .get('tripStartDatetime')
        .setValue(
          this.datePipe.transform(
            tripData.tripStartDatetime,
            'd MMM yyyy, hh:mm a'
          )
        );
      this.returnToInputDate = new Date(tripData.tripStartDatetime);
      this.tripUpdateForm
        .get('categoryId')
        .setValue(tripData.vehicleCategory.id);
      this.tripUpdateForm.get('numOfTrucks').setValue(tripData.numOfTrucks);
      this.tripUpdateForm.get('truckSize').setValue(tripData.truckSize);
      this.tripUpdateForm
        .get('truckCapacityInTon')
        .setValue(tripData.truckCapacityInTon);
      this.tripUpdateForm.get('paymentType').setValue(tripData.paymentType);
      this.paymentType.forEach((paymentType: any) => {
        paymentType.active = false;
        if (paymentType.enumName === tripData.paymentType) {
          paymentType.active = paymentType.enumName === tripData.paymentType;
        }
      });
      this.tripUpdateForm.get('tripType').setValue(tripData.tripType);
      this.tripTypes.forEach((tripType: any) => {
        tripType.active = tripType.enumName === tripData.tripType;
      });
      this.tripUpdateForm.get('goodsId').setValue(tripData.good?.id);
      this.tripUpdateForm.get('goodsName').setValue(tripData.good?.name);
      this.tripUpdateForm.get('customerRate').setValue(tripData.customerRate);
      this.tripUpdateForm.get('note').setValue(tripData.note);
      this.tripUpdateForm.get('source').setValue(tripData?.sourceOfTruck)
      this.truckSourceList.forEach((source: any) => {
        source.active = source.value === tripData?.sourceOfTruck
      })
      this.truckSourcePlaceholder = this.truckSourceList.find(
        option => option.value === tripData?.sourceOfTruck
      )?.value;

      this.tripUpdateForm
        .get('transporterName')
        .setValue(tripData.transporterName);
      this.tripUpdateForm
        .get('transporterPhone')
        .setValue(tripData.transporterPhone);
      this.tripUpdateForm
        .get('transporterRate')
        .setValue(tripData.transporterRate);
      this.tripUpdateForm
        .get('transporterCode')
        .setValue(tripData.transporterCode);
      this.tripUpdateForm.get('driverCode').setValue(tripData.driverCode);
      this.tripUpdateForm.get('driverName').setValue(tripData.driverName);
      this.tripUpdateForm.get('driverPhone').setValue(tripData.driverPhone);
      this.tripUpdateForm.get('helperCode').setValue(tripData.helperCode);
      this.tripUpdateForm.get('helperName').setValue(tripData.helperName);
      this.tripUpdateForm.get('helperPhone').setValue(tripData.helperPhone);
      this.tripUpdateForm.get('truckId').setValue(tripData.truck?.id);
      this.tripUpdateForm
        .get('registrationZone')
        .setValue(tripData.truck?.registrationZone);
      this.tripUpdateForm
        .get('registrationCategory')
        .setValue(tripData.truck?.registrationCategory);
      this.tripUpdateForm
        .get('registrationSerialNumber')
        .setValue(tripData.truck?.registrationSerial);
      this.tripUpdateForm
        .get('registrationNumber')
        .setValue(tripData.truck?.registrationNum);

      const loadingPoints = tripData.tripPoints.filter(
        (point: any) => point.pointType === 'Loading'
      );
      const unloadingPoints = tripData.tripPoints.filter(
        (point: any) => point.pointType === 'Unloading'
      );
      loadingPoints?.forEach((point: any, index: number) => {
        if (index > 0) {
          this.addLoadingPoint();
        }
        if (point.id !== null && point.id !== undefined && point.id !== '') {
          this.loadingPoints.controls[index].get('id').setValue(point.id);
        }
        this.loadingPoints.controls[index]
          .get('pointDistrict')
          .setValue(point.pointDistrict);
        this.loadingPoints.controls[index]
          .get('pointName')
          .setValue(point.pointName);
        this.loadingPoints.controls[index]
          .get('pointLat')
          .setValue(point.pointLat);
        this.loadingPoints.controls[index]
          .get('pointLon')
          .setValue(point.pointLon);
      });
      unloadingPoints?.forEach((point: any, index: number) => {
        if (index > 0) {
          this.addUnloadingPoint();
        }
        if (point.id !== null && point.id !== undefined && point.id !== '') {
          this.unloadingPoints.controls[index].get('id').setValue(point.id);
        }
        this.unloadingPoints.controls[index]
          .get('pointDistrict')
          .setValue(point.pointDistrict);
        this.unloadingPoints.controls[index]
          .get('pointName')
          .setValue(point.pointName);
        this.unloadingPoints.controls[index]
          .get('pointLat')
          .setValue(point.pointLat);
        this.unloadingPoints.controls[index]
          .get('pointLon')
          .setValue(point.pointLon);
      });
    }
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  onKeyUpHelperSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value.length > 0) {
      this.user.getHelpers(0, 100, value).subscribe((res: any) => {
        this.helperSuggestion = res.data.responses;
      });
    }
  }

  onClickHelperSearchSuggestion(option: any) {
    this.tripUpdateForm.get('helperCode').setValue(option.userId);
    this.tripUpdateForm.get('helperName').setValue(option.name);
    this.tripUpdateForm.get('helperPhone').setValue(option.phone);
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

        }
      });
  }

  onSelect($event: any) {
    this.selectedDate = $event;
    this.returnToInputDate = $event;
  }

  isButtonDisabled($event: boolean) {
    this.isDisabled = $event;
  }

  onTimeChange($event: any) {
    this.time = $event;
  }

  private time: any;
  tripStatus: string;

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
    this.tripUpdateForm
      .get('tripStartDatetime')
      .setValue(
        this.datePipe.transform(this.selectedDate, 'd MMM yyyy, hh:mm a')
      );
  }

  protected readonly tripTypes: tripType[] = tripTypes;
  protected readonly paymentType: paymentType[] = paymentTypes;

  truckSourceList: CustomInputSelectModel[] = [
    {
      id: 1,
      value: 'Owner',
      showname: 'Owner',
      selected: false,
    },
    {
      id: 2,
      value: 'Agency',
      showname: 'Agency',
      selected: true,
    },
    {
      id: 3,
      value: 'Driver',
      showname: 'Driver',
      selected: false,
    },
    {
      id: 4,
      value: 'Others',
      showname: 'Others',
      selected: false,
    },
  ];
  truckSourcePlaceholder: string = '';

  onSelectTruckSource($event: number) {
    this.truckSourcePlaceholder = this.truckSourceList.find(
      option => option.id === $event
    ).value;
    this.tripUpdateForm.get('source').setValue(this.truckSourcePlaceholder);
    this.truckSourceList.forEach(option => {
      option.selected = option.id === $event;
    });
  }

  onTripTypeClick(type: tripType) {
    switch (type.id) {
      case 1:
        this.tripUpdateForm.get('tripType').setValue('COMMERCIAL');
        this.tripTypes.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
      case 2:
        this.tripUpdateForm.get('tripType').setValue('PROJECT');
        this.tripTypes.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
      default:
        this.tripUpdateForm.get('tripType').setValue('COMMERCIAL');
        this.tripTypes.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
    }
  }

  onPaymentTypeClick(type: paymentType) {
    switch (type.id) {
      case 1:
        this.tripUpdateForm.get('paymentType').setValue('CASH');
        this.paymentType.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
      case 2:
        this.tripUpdateForm.get('paymentType').setValue('INVOICE');
        this.paymentType.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
      case 3:
        this.tripUpdateForm.get('paymentType').setValue('CASH_AND_INVOICE');
        this.paymentType.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
      case 4:
        this.tripUpdateForm.get('paymentType').setValue('COMMISSION');
        this.paymentType.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
      default:
        this.tripUpdateForm.get('paymentType').setValue('INVOICE');
        this.paymentType.forEach(
          (element: any) => (element.active = element.id === type.id)
        );
        break;
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
}
