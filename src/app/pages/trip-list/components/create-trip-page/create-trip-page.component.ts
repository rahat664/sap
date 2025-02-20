import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollByButtonDirective } from '../../../../shared/directive/scroll-by-button.directive';
import { TripService } from '../../services/trip.service';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  ErrorStateMatcher,
  provideNativeDateAdapter,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import { MatCard } from '@angular/material/card';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TimePickerComponent } from '../../../../shared/modules/time-picker/time-picker.component';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { TripCreate } from '../../models/trip-create.model';
import { TripTemplateResponse } from '../../models/trip-template-response.model';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'app-create-trip-page',
  imports: [
    CommonModule,
    ScrollByButtonDirective,
    ReactiveFormsModule,
    FormsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    TextFieldModule,
    MatDatepickerModule,
    MatCard,
    MatMenuTrigger,
    MatMenu,
    TimePickerComponent,
    MatCheckbox,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatTooltip,
    FallbackImagePipe,
    ImageErrorDirective,
    MatRadioGroup,
    MatRadioButton,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
  templateUrl: './create-trip-page.component.html',
  styleUrl: './create-trip-page.component.scss',
})
export class CreateTripPageComponent implements OnInit {
  goodsOptionsArray: CustomInputSelectModel[] = [];
  tripForm: FormGroup;
  district: any;
  @Input() template: any;
  @Input() customerName: string;
  @Input() templateEnabled = false;
  vehicleTypeList: any;
  truckCapacitySuggestions: any[];
  truckSizeSuggestions: any[];
  saveTemplateInputEnabled: boolean;
  private readonly _currentYear = new Date().getFullYear();
  // give mindate validation min date is current date
  readonly minDate = new Date();
  private time: any;
  loadingSuggestions: any;
  unloadingSuggestions: any;
  loadingGoodsSuggestions: any;
  returnToInputDate: any;
  isDisabled: boolean;
  tripDataModel: TripCreate = new TripCreate();
  numberOfTrucksSuggestions: any;
  isFromTemplate = false;

  constructor(
    private service: TripService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private locationService: GeolocationService,
    private router: Router,
    private toaster: HandleToastrService
  ) {}

  onCreateTrip() {
    if (this.tripForm.valid) {
      this.tripDataModel.customerCode = this.tripForm.get('customerCode').value;
      this.tripDataModel.tripStartDatetime = this.datePipe.transform(
        new Date(this.tripForm.get('tripStartDatetime').value),
        'yyyy-MM-ddTHH:mm:ss'
      );
      this.tripDataModel.categoryId = this.tripForm.get('categoryId').value;
      this.tripDataModel.numOfTrucks = this.tripForm.get('numOfTrucks').value;
      this.tripDataModel.truckSize = this.tripForm.get('truckSize').value;
      this.tripDataModel.truckCapacityInTon =
        this.tripForm.get('truckCapacityInTon').value;
      this.tripDataModel.goodsId = this.tripForm.get('goodsId').value;
      this.tripDataModel.goodsName = this.tripForm.get('goodsName').value;
      this.tripDataModel.customerRate = this.tripForm.get('customerRate').value;
      this.tripDataModel.paymentType = this.tripForm.get('paymentType').value;
      this.tripDataModel.note = this.tripForm.get('note').value;
      this.tripDataModel.points = [
        ...this.tripForm.get('loadingPoints').value,
        ...this.tripForm.get('unloadingPoints').value,
      ];
      localStorage.setItem('tripData', JSON.stringify(this.tripDataModel));
      this.checkCacheDataAndUpdate(
        this.tripDataModel.numOfTrucks,
        this.tripDataModel.truckSize,
        this.tripDataModel.truckCapacityInTon
      );
      if (this.saveTemplateInputEnabled) {
        localStorage.setItem(
          'templateName',
          this.tripForm.get('tripTemplateName').value
        );
      } else {
        localStorage.removeItem('templateName');
      }
      localStorage.setItem('isFromTemplate', JSON.stringify(false));
      localStorage.removeItem('selectedTemplate');
      this.router.navigate(['/trip-create/overview']);
    } else {
      this.tripForm.markAllAsTouched();
      // list out all the invalid fields
      const invalidFields = Object.keys(this.tripForm.controls).filter(
        key => this.tripForm.controls[key].invalid
      );
      // concat all the invalid fields
      let message = '';
      invalidFields.forEach((field, index) => {
        switch (field) {
          case 'loadingPointDistrict':
            field = 'Loading Point District';
            break;
          case 'loadingPointName':
            field = 'Loading Point Name';
            break;
          case 'unloadingPointDistrict':
            field = 'Unloading Point District';
            break;
          case 'paymentType':
            field = 'Payment Type';
            break;
          case 'unloadingPointName':
            field = 'Unloading Point Name';
            break;
          case 'loadingPointLatitude':
            field = 'Loading Point Latitude';
            break;
          case 'loadingPointLongitude':
            field = 'Loading Point Longitude';
            break;
          case 'unloadingPointLatitude':
            field = 'Unloading Point Latitude';
            break;
          case 'unloadingPointLongitude':
            field = 'Unloading Point Longitude';
            break;
          case 'tripTemplateName':
            field = 'Template Name';
            break;
          case 'customerCode':
            field = 'Customer';
            break;
          case 'categoryId':
            field = 'Vehicle Type';
            break;
          case 'numOfTrucks':
            field = 'Number of Trucks';
            break;
          case 'truckSize':
            field = 'Truck Size';
            break;
          case 'truckCapacityInTon':
            field = 'Truck Capacity';
            break;
          case 'goodsId':
            field = 'Goods';
            break;
          case 'goodsName':
            field = 'Goods Name';
            break;
          case 'tripStartDatetime':
            field = 'Trip Start Date';
            break;
          case 'customerRate':
            field = 'Customer Rate';
            break;
          case 'note':
            field = 'Note';
            break;
          default:
            field = field.charAt(0).toUpperCase() + field.slice(1);
            break;
        }
        message += field;
        if (index !== invalidFields.length - 1) {
          message += ', ';
        }
      });
      this.toaster.showError(`Please fill the required fields: ${message}`);
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
    const isFromTemplate = JSON.parse(localStorage.getItem('isFromTemplate'));
    const isFromBackEdit = JSON.parse(localStorage.getItem('isFromBackEdit'));
    this.isFromTemplate = isFromTemplate;
    if (isFromTemplate) {
      this.setTheValuesFromTemplate();
    }
    if (isFromBackEdit) {
      this.setBackEditValues();
    }

    this.returnToInputDate = new Date();
    this.selectedCustomer = JSON.parse(
      localStorage.getItem('selectedCustomer')
    );
    if (this.selectedCustomer) {
      this.customerName = this.selectedCustomer.name;
      this.tripForm
        .get('customerCode')
        .setValue(this.selectedCustomer.customerCode);
    }
    // set value with extra 6 hours of current date time
    this.tripForm
      .get('tripStartDatetime')
      .setValue(
        this.datePipe.transform(
          new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
          'd MMM yyyy HH:mm:ss'
        )
      );
  }

  private getVehicleTypeList() {
    this.service.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
      if (JSON.parse(localStorage.getItem('isFromTemplate'))) {
        const selectedTemplate = JSON.parse(
          localStorage.getItem('selectedTemplate')
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
    this.tripForm.get('categoryId').setValue(item.id);
    this.vehicleTypeList.forEach((element: any) => {
      element.selected = false;
    });
    item.selected = true;
  }

  selectedDate: Date = new Date();
  loadingDistrictSuggestions: any;
  unloadingDistrictSuggestions: any;
  selectedCustomer: any;

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
    this.truckCapacitySuggestions = JSON.parse(
      localStorage.getItem('truckCapacity')
    );
    this.truckSizeSuggestions = JSON.parse(localStorage.getItem('truckSize'));
    this.numberOfTrucksSuggestions = JSON.parse(
      localStorage.getItem('noOfTrucks')
    );
  }

  onClickTruckCapacitySuggestions(suggestion: any) {
    this.tripForm.get('truckCapacityInTon').setValue(suggestion.value);
    this.truckCapacitySuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckCapacity.next(this.truckCapacitySuggestions);
  }

  onClickTruckSizeSuggestions(suggestion: any) {
    this.tripForm.get('truckSize').setValue(suggestion.value);
    this.truckSizeSuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckSize.next(this.truckSizeSuggestions);
  }

  toggleSaveAsTemplateInputField($any: any) {
    this.saveTemplateInputEnabled = $any.checked;
    if ($any.checked) {
      this.tripForm.get('tripTemplateName').setValidators(Validators.required);
    } else {
      this.tripForm.get('tripTemplateName').clearValidators();
    }
    this.tripForm.get('tripTemplateName').updateValueAndValidity();
  }

  private initializeForm() {
    this.tripForm = this.fb.group({
      customerCode: ['', Validators.required],
      tripStartDatetime: ['', Validators.required],
      categoryId: ['', Validators.required],
      numOfTrucks: ['', Validators.required],
      truckSize: ['', Validators.required],
      truckCapacityInTon: ['', Validators.required],
      goodsId: [''],
      paymentType: ['', Validators.required],
      goodsName: ['', Validators.required],
      customerRate: [null],
      note: [''],
      loadingPoints: this.fb.array([this.createLoadingPoint()]),
      unloadingPoints: this.fb.array([this.createUnloadingPoint()]),
      tripTemplateName: [''],
    });
  }

  onSelect($event: any) {
    this.selectedDate = $event;
    this.returnToInputDate = $event;
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
    this.tripForm
      .get('tripStartDatetime')
      .setValue(
        this.datePipe.transform(this.selectedDate, 'd MMM yyyy, hh:mm a')
      );
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
    this.tripForm.get('goodsId').setValue(option.id);
    this.tripForm.get('goodsName').setValue(option.value);
  }

  onKeyUpGoods($event: KeyboardEvent) {
    const target = $event.target as HTMLInputElement;
    const goodsOptions = JSON.parse(JSON.stringify(this.goodsOptionsArray));
    if (target.value.length > 1) {
      this.loadingGoodsSuggestions = goodsOptions.filter((option: any) =>
        option.value.toLowerCase().includes(target.value.toLowerCase())
      );
    } else {
      this.loadingGoodsSuggestions = [];
    }
  }

  isButtonDisabled($event: boolean) {
    this.isDisabled = $event;
  }

  private setTheValuesFromTemplate() {
    const template: TripTemplateResponse = JSON.parse(
      localStorage.getItem('selectedTemplate')
    );
    this.tripForm.get('categoryId').setValue(template?.vehicleCategory?.id);
    this.tripForm.get('numOfTrucks').setValue(template.numOfTrucks);
    this.tripForm.get('truckSize').setValue(template.truckSize);
    this.tripForm
      .get('truckCapacityInTon')
      .setValue(template.truckCapacityInTon);
    this.tripForm.get('goodsId').setValue(template.good.id);
    this.tripForm.get('goodsName').setValue(template.good.name);
    this.tripForm.get('customerRate').setValue(template.customerRate);
    this.tripForm.get('note').setValue(template.note);
    this.tripForm.get('paymentType').setValue(template.paymentType);
    const templateLoadingPoints = template.points.filter(
      point => point.pointType === 'Loading'
    );
    const templateUnloadingPoints = template.points.filter(
      point => point.pointType === 'Unloading'
    );
    templateLoadingPoints.forEach((point: any, index: number) => {
      if (index > 0) {
        this.addLoadingPoint();
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
    templateUnloadingPoints.forEach((point: any, index: number) => {
      if (index > 0) {
        this.addUnloadingPoint();
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

  onClickNoOfTruckSuggestion(suggestion: any) {
    this.tripForm.get('numOfTrucks').setValue(suggestion.value);
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

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  private setBackEditValues() {
    const tripData = JSON.parse(localStorage.getItem('tripData'));
    this.tripForm.get('customerCode').setValue(tripData.customerCode);
    this.tripForm.get('tripStartDatetime').setValue(tripData.tripStartDatetime);
    this.tripForm.get('categoryId').setValue(tripData.categoryId);
    this.tripForm.get('numOfTrucks').setValue(tripData.numOfTrucks);
    this.tripForm.get('truckSize').setValue(tripData.truckSize);
    this.tripForm.get('paymentType').setValue(tripData.paymentType);
    this.tripForm
      .get('truckCapacityInTon')
      .setValue(tripData.truckCapacityInTon);
    this.tripForm.get('goodsId').setValue(tripData.goodsId);
    this.tripForm.get('goodsName').setValue(tripData.goodsName);
    this.tripForm.get('customerRate').setValue(tripData.customerRate);
    this.tripForm.get('note').setValue(tripData.note);
    const loadingPoints = tripData.points.filter(
      (point: any) => point.pointType === 'Loading'
    );
    const unloadingPoints = tripData.points.filter(
      (point: any) => point.pointType === 'Unloading'
    );
    loadingPoints.forEach((point: any, index: number) => {
      if (index > 0) {
        this.addLoadingPoint();
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

    unloadingPoints.forEach((point: any, index: number) => {
      if (index > 0) {
        this.addUnloadingPoint();
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

  // on click browser back button
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    localStorage.setItem('backFromTemplateEditOrUpdate', 'true');
  }

  protected readonly Number = Number;

  private createLoadingPoint() {
    return this.fb.group({
      pointDistrict: ['', Validators.required],
      pointName: ['', Validators.required],
      pointLat: ['', Validators.required],
      pointLon: ['', Validators.required],
      pointType: ['Loading'],
    });
  }

  private createUnloadingPoint() {
    return this.fb.group({
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
    return this.tripForm.get('loadingPoints') as FormArray;
  }

  addUnloadingPoint() {
    this.unloadingPoints.push(this.createUnloadingPoint());
  }

  get unloadingPoints() {
    return this.tripForm.get('unloadingPoints') as FormArray;
  }

  removeLoadingPoint(index: number) {
    this.loadingPoints.removeAt(index);
  }

  removeUnloadingPoint(index: number) {
    this.unloadingPoints.removeAt(index);
  }
}
