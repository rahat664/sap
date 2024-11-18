import { Component, inject, Input } from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { MyErrorStateMatcher } from '../template-create/template-create.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripService } from '../../services/trip.service';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';
import { Router } from '@angular/router';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatMenuTrigger } from '@angular/material/menu';
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

@Component({
  selector: 'app-trip-update',
  standalone: true,
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
  ],
  templateUrl: './trip-update.component.html',
  styleUrl: './trip-update.component.scss',
})
export class TripUpdateComponent {
  readonly dialog = inject(MatDialog);
  goodsOptionsArray: CustomInputSelectModel[] = [];
  matcher = new MyErrorStateMatcher();
  tripUpdateForm: FormGroup;
  district: any;
  @Input() template: any;
  @Input() customerName: string;
  @Input() templateEnabled: boolean = false;
  vehicleTypeList: any;
  truckCapacitySuggestions: any[];
  truckSizeSuggestions: any[];
  loadingSuggestions: any;
  unloadingSuggestions: any;
  loadingGoodsSuggestions: any;
  numberOfTrucksSuggestions: any;
  isFromTemplate: boolean = false;
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
              categoryId: this.tripUpdateForm.get('categoryId').value,
              numOfTrucks: this.tripUpdateForm.get('numOfTrucks').value,
              truckSize: this.tripUpdateForm.get('truckSize').value,
              truckCapacityInTon:
                this.tripUpdateForm.get('truckCapacityInTon').value,
              goodsId: this.tripUpdateForm.get('goodsId').value,
              goodsName: this.tripUpdateForm.get('goodsName').value,
              customerRate: this.tripUpdateForm.get('customerRate').value,
              note: this.tripUpdateForm.get('note').value,
              points: [
                ...this.tripUpdateForm.get('loadingPoints').value,
                ...this.tripUpdateForm.get('unloadingPoints').value,
              ],
              transporterCode: this.tripUpdateForm.get('transporterCode').value,
              transporterName: this.tripUpdateForm.get('transporterName').value,
              transporterPhone:
                this.tripUpdateForm.get('transporterPhone').value,
              transporterRate: this.tripUpdateForm.get('transporterRate').value,
              truckId: this.tripUpdateForm.get('truckId').value,
            };
            if (this.tripUpdateForm.get('driverCode').value) {
              body['driverCode'] = this.tripUpdateForm.get('driverCode').value;
            }
            if (this.tripUpdateForm.get('driverName').value) {
              body['driverName'] = this.tripUpdateForm.get('driverName').value;
            }
            if (this.tripUpdateForm.get('driverPhone').value) {
              body['driverPhone'] =
                this.tripUpdateForm.get('driverPhone').value;
            }
            if (this.tripUpdateForm.get('helperCode').value) {
              body['helperCode'] = this.tripUpdateForm.get('helperCode').value;
            }
            if (this.tripUpdateForm.get('helperName').value) {
              body['helperName'] = this.tripUpdateForm.get('helperName').value;
            }
            if (this.tripUpdateForm.get('helperPhone').value) {
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

  scrollable: boolean = false;
  rightButtonClicked: boolean = false;
  leftButtonClicked: boolean = false;

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
      categoryId: [''],
      numOfTrucks: [''],
      truckSize: [''],
      truckCapacityInTon: [''],
      goodsId: [''],
      goodsName: [''],
      customerRate: [null],
      note: [''],
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
        this.transporterSuggestion = res.data.responses;
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

  onKeyUpUnloadingPoint($event: KeyboardEvent, i:number) {
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
    this.unloadingPoints?.controls[i]?.get('pointDistrict').setValue(option.name);
    if (
      this.unloadingPoints?.controls[i]?.get('pointLat').value === '' ||
      this.unloadingPoints?.controls[i]?.get('pointLon').value === ''
    ) {
      this.unloadingPoints?.controls[i]
        .setValue(
          this.unloadingPoints?.controls[i]?.get('pointLat').value
            ? this.unloadingPoints?.controls[i]?.get('pointLat').value
            : option.lat
        );
      this.unloadingPoints?.controls[i]
        .setValue(
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
          this.tripUpdateForm.get('driverCode').setValue('');
          this.tripUpdateForm.get('driverName').setValue('');
          this.tripUpdateForm.get('driverPhone').setValue('');
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
          this.tripUpdateForm.get('truckId').setValue('');
          this.tripUpdateForm.get('registrationZone').setValue('');
          this.tripUpdateForm.get('registrationCategory').setValue('');
          this.tripUpdateForm.get('registrationSerialNumber').setValue('');
          this.tripUpdateForm.get('registrationNumber').setValue('');
        }
      });
  }

  onClickTransporterSearchSuggestion(option: any) {
    this.tripUpdateForm.get('transporterName').setValue(option.name);
    this.tripUpdateForm.get('transporterPhone').setValue(option.phone);
  }

  onClickDriverSearchSuggestion(option: any) {
    this.tripUpdateForm.get('driverName').setValue(option.name);
    this.tripUpdateForm.get('driverPhone').setValue(option.phone);
  }

  private getValueFromTripDetails() {
    const tripData = JSON.parse(localStorage.getItem('updateTripDetails'));
    if (tripData) {
      this.tripUpdateForm
        .get('categoryId')
        .setValue(tripData.vehicleCategory.id);
      this.tripUpdateForm.get('numOfTrucks').setValue(tripData.numOfTrucks);
      this.tripUpdateForm.get('truckSize').setValue(tripData.truckSize);
      this.tripUpdateForm
        .get('truckCapacityInTon')
        .setValue(tripData.truckCapacityInTon);
      this.tripUpdateForm.get('goodsId').setValue(tripData.good?.id);
      this.tripUpdateForm.get('goodsName').setValue(tripData.good?.name);
      this.tripUpdateForm.get('customerRate').setValue(tripData.customerRate);
      this.tripUpdateForm.get('note').setValue(tripData.note);
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
        this.loadingPoints.controls[index].get('pointDistrict').setValue(point.pointDistrict);
        this.loadingPoints.controls[index].get('pointName').setValue(point.pointName);
        this.loadingPoints.controls[index].get('pointLat').setValue(point.pointLat);
        this.loadingPoints.controls[index].get('pointLon').setValue(point.pointLon);
      });
      unloadingPoints?.forEach((point: any, index: number) => {
        if (index > 0) {
          this.addUnloadingPoint();
        }
        if (point.id !== null && point.id !== undefined && point.id !== '') {
          this.unloadingPoints.controls[index].get('id').setValue(point.id);
        }
        this.unloadingPoints.controls[index].get('pointDistrict').setValue(point.pointDistrict);
        this.unloadingPoints.controls[index].get('pointName').setValue(point.pointName);
        this.unloadingPoints.controls[index].get('pointLat').setValue(point.pointLat);
        this.unloadingPoints.controls[index].get('pointLon').setValue(point.pointLon);
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
          this.tripUpdateForm.get('helperCode').setValue('');
          this.tripUpdateForm.get('helperName').setValue('');
          this.tripUpdateForm.get('helperPhone').setValue('');
        }
      });
  }
}
