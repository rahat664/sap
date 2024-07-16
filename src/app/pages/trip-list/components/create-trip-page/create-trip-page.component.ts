import { Component, Input, OnInit } from '@angular/core';
import { CustomDatePickerComponent } from '../../../../shared/modules/custom-date-picker/custom-date-picker.component';
import { ButtonChipsComponent } from '../../modules/button-chips/button-chips.component';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollByButtonDirective } from '../../../../shared/directive/scroll-by-button.directive';
import { TripService } from '../../services/trip.service';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import {
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
import { MatExpansionPanelActionRow } from '@angular/material/expansion';
import { MatCard } from '@angular/material/card';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TimePickerComponent } from '../../../../shared/modules/time-picker/time-picker.component';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';
import { districts } from '../../../profiles/components/transporter/models/districts';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MyErrorStateMatcher } from '../template-create/template-create.component';
import { TripCreate } from '../../models/trip-create.model';
import { TripTemplateResponse } from '../../models/trip-template-response.model';

@Component({
  selector: 'app-create-trip-page',
  standalone: true,
  imports: [
    CustomDatePickerComponent,
    ButtonChipsComponent,
    CommonModule,
    ScrollByButtonDirective,
    CustomInputComponent,
    GetClickEventDirective,
    ReactiveFormsModule,
    FormsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    TextFieldModule,
    MatDatepickerModule,
    MatExpansionPanelActionRow,
    MatCard,
    MatMenuTrigger,
    MatMenu,
    TimePickerComponent,
    MatCheckbox,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatTooltip,
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
  matcher = new MyErrorStateMatcher();
  tripForm: FormGroup;
  district: any = districts;
  @Input() template: any;
  @Input() customerName: string;
  @Input() templateEnabled: boolean = false;
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
  isFromTemplate: boolean = false;

  constructor(
    private service: TripService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private locationService: GeolocationService,
    private router: Router
  ) {}

  onCreateTrip() {
    if (this.tripForm.valid) {
      this.tripDataModel.customerCode = this.tripForm.get('customerCode').value;
      this.tripDataModel.tripStartDatetime = this.datePipe.transform(
        new Date(this.tripForm.get('tripStartDatetime').value),
        'yyyy-MM-dd HH:mm:ss'
      );
      this.tripDataModel.categoryId = this.tripForm.get('categoryId').value;
      this.tripDataModel.numOfTrucks = this.tripForm.get('numOfTrucks').value;
      this.tripDataModel.truckSize = this.tripForm.get('truckSize').value;
      this.tripDataModel.truckCapacityInTon =
        this.tripForm.get('truckCapacityInTon').value;
      this.tripDataModel.goodsId = this.tripForm.get('goodsId').value;
      this.tripDataModel.goodsName = this.tripForm.get('goodsName').value;
      this.tripDataModel.customerRate = this.tripForm.get('customerRate').value;
      this.tripDataModel.note = this.tripForm.get('note').value;
      this.tripDataModel.points = [
        {
          pointDistrict: this.tripForm.get('loadingPointDistrict').value,
          pointName: this.tripForm.get('loadingPointName').value,
          pointLat: this.tripForm.get('loadingPointLatitude').value,
          pointLon: this.tripForm.get('loadingPointLongitude').value,
          pointType: 'Loading',
        },
        {
          pointDistrict: this.tripForm.get('unloadingPointDistrict').value,
          pointName: this.tripForm.get('unloadingPointName').value,
          pointLat: this.tripForm.get('unloadingPointLatitude').value,
          pointLon: this.tripForm.get('unloadingPointLongitude').value,
          pointType: 'Unloading',
        },
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
      console.log('Form is invalid');
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
    this.getVehicleTypeList();
    this.getGoodsOptions();
    this.getCachedData();
    this.intializeForm();
    const isFromTemplate = JSON.parse(localStorage.getItem('isFromTemplate'));
    this.isFromTemplate = isFromTemplate;
    if (isFromTemplate) {
      this.setTheValuesFromTemplate();
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
          'dd MMM yyyy, hh:mm a'
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
  }

  private intializeForm() {
    this.tripForm = this.fb.group({
      customerCode: ['', Validators.required],
      tripStartDatetime: ['', Validators.required],
      categoryId: ['', Validators.required],
      numOfTrucks: ['', Validators.required],
      truckSize: ['', Validators.required],
      truckCapacityInTon: ['', Validators.required],
      goodsId: [''],
      goodsName: ['', Validators.required],
      customerRate: [null, Validators.required],
      note: [''],
      loadingPointDistrict: ['', Validators.required],
      loadingPointName: ['', Validators.required],
      unloadingPointDistrict: ['', Validators.required],
      unloadingPointName: ['', Validators.required],
      loadingPointLatitude: ['', Validators.required],
      loadingPointLongitude: ['', Validators.required],
      unloadingPointLatitude: ['', Validators.required],
      unloadingPointLongitude: ['', Validators.required],
      tripTemplateName: [''],
    });
  }

  onSelect($event: any) {
    this.selectedDate = $event;
    this.returnToInputDate = $event;
  }

  onTimeChange($event: any) {
    this.time = $event;
    console.log(this.time);
  }

  onSelectTimeAndDate() {
    // convert time to 24 hour format
    const time = this.time.split(' ')[0];
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);
    const amOrPm = this.time.split(' ')[1];
    const timeIn24HourFormat = amOrPm === 'PM' ? hour + 12 : hour;
    const selectedDate = this.selectedDate;
    selectedDate.setHours(timeIn24HourFormat, hour);
    selectedDate.setMinutes(minute);
    console.log(selectedDate);
    this.tripForm
      .get('tripStartDatetime')
      .setValue(
        this.datePipe.transform(this.selectedDate, 'dd MMM yyyy, hh:mm a')
      );
  }

  onKeyUpLoadingPoint($event: KeyboardEvent) {
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.service
        .getLocationSuggestions(target.value, target.value)
        .subscribe((res: any) => {
          this.loadingSuggestions = res.data;
        });
    } else {
      this.loadingSuggestions = [];
      this.tripForm.get('loadingPointDistrict').enable();
      this.tripForm.get('loadingPointDistrict').setValue('');
      this.tripForm.get('loadingPointLatitude').setValue('');
      this.tripForm.get('loadingPointLongitude').setValue('');
    }
  }

  onClickLoadingSuggestion(option: any) {
    option.locationPointName
      ? this.tripForm.get('loadingPointName').setValue(option.locationPointName)
      : this.tripForm.get('loadingPointName').setValue(option.addressText);
    if (option.district) {
      this.tripForm.get('loadingPointDistrict').setValue(option.district);
      this.tripForm.get('loadingPointDistrict').disable();
    } else {
      this.tripForm.get('loadingPointDistrict').enable();
    }

    if (option.latitude > 0 && option.longitude > 0) {
      this.tripForm.get('loadingPointLatitude').setValue(option.latitude);
      this.tripForm.get('loadingPointLongitude').setValue(option.longitude);
    } else {
      this.locationService.getLatLong(option.placeId).subscribe((res: any) => {
        const lat = res.result.geometry.location.lat;
        const lng = res.result.geometry.location.lng;
        this.tripForm.get('loadingPointLatitude').setValue(lat);
        this.tripForm.get('loadingPointLongitude').setValue(lng);
      });
    }
    this.loadingSuggestions = [];
  }

  onClickUnloadingSuggestion(option: any) {
    this.tripForm
      .get('unloadingPointName')
      .setValue(
        option.locationPointName ? option.locationPointName : option.addressText
      );
    if (option.district) {
      this.tripForm.get('unloadingPointDistrict').setValue('');
      this.tripForm.get('unloadingPointDistrict').setValue(option.district);
      this.tripForm.get('unloadingPointDistrict').disable();
    } else {
      this.tripForm.get('unloadingPointDistrict').enable();
    }
    if (option.latitude > 0 && option.longitude > 0) {
      this.tripForm.get('unloadingPointLatitude').setValue(option.latitude);
      this.tripForm.get('unloadingPointLongitude').setValue(option.longitude);
    } else {
      this.locationService.getLatLong(option.placeId).subscribe((res: any) => {
        this.tripForm
          .get('unloadingPointLatitude')
          .setValue(res?.result?.geometry?.location?.lat);
        this.tripForm
          .get('unloadingPointLongitude')
          .setValue(res?.result?.geometry?.location?.lng);
      });
    }
    this.unloadingSuggestions = [];
  }

  onKeyUpUnloadingPoint($event: KeyboardEvent) {
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.service
        .getLocationSuggestions(target.value, target.value)
        .subscribe((res: any) => {
          this.unloadingSuggestions = res.data;
        });
    } else {
      this.unloadingSuggestions = [];
      this.tripForm.get('unloadingPointDistrict').enable();
      this.tripForm.get('unloadingPointDistrict').setValue('');
      this.tripForm.get('unloadingPointLatitude').setValue('');
      this.tripForm.get('unloadingPointLongitude').setValue('');
    }
  }

  onKeyUpLoadingDistrict($event: KeyboardEvent) {
    const districts = JSON.parse(JSON.stringify(this.district));
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.loadingDistrictSuggestions = districts.filter((district: any) =>
        district.nameEn.toLowerCase().includes(target.value.toLowerCase())
      );
    } else {
      this.loadingDistrictSuggestions = [];
    }
  }

  onSelectLoadingDistrict(option: any) {
    this.tripForm.get('loadingPointDistrict').setValue(option.nameEn);
    this.tripForm
      .get('loadingPointLatitude')
      .setValue(
        this.tripForm.get('loadingPointLatitude').value
          ? this.tripForm.get('loadingPointLatitude').value
          : option.lat
      );
    this.tripForm
      .get('loadingPointLongitude')
      .setValue(
        this.tripForm.get('loadingPointLongitude').value
          ? this.tripForm.get('loadingPointLongitude').value
          : option.lon
      );
    this.loadingDistrictSuggestions = [];
  }

  onKeyUpUnloadingDistrict($event: KeyboardEvent) {
    const districts = JSON.parse(JSON.stringify(this.district));
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.unloadingDistrictSuggestions = districts.filter((district: any) =>
        district.nameEn.toLowerCase().includes(target.value.toLowerCase())
      );
    } else {
      this.unloadingDistrictSuggestions = [];
    }
  }

  onSelectUnloadingDistrict(option: any) {
    this.tripForm.get('unloadingPointDistrict').setValue(option.nameEn);
    this.tripForm
      .get('unloadingPointLatitude')
      .setValue(
        this.tripForm.get('unloadingPointLatitude').value
          ? this.tripForm.get('unloadingPointLatitude').value
          : option.lat
      );
    this.tripForm
      .get('unloadingPointLongitude')
      .setValue(
        this.tripForm.get('unloadingPointLongitude').value
          ? this.tripForm.get('unloadingPointLongitude').value
          : option.lon
      );
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
    this.tripForm
      .get('loadingPointDistrict')
      .setValue(template.points[0].pointDistrict);
    this.tripForm
      .get('loadingPointName')
      .setValue(template.points[0].pointName);
    this.tripForm
      .get('loadingPointLatitude')
      .setValue(template.points[0].pointLat);
    this.tripForm
      .get('loadingPointLongitude')
      .setValue(template.points[0].pointLon);
    this.tripForm
      .get('unloadingPointDistrict')
      .setValue(template.points[1].pointDistrict);
    this.tripForm
      .get('unloadingPointName')
      .setValue(template.points[1].pointName);
    this.tripForm
      .get('unloadingPointLatitude')
      .setValue(template.points[1].pointLat);
    this.tripForm
      .get('unloadingPointLongitude')
      .setValue(template.points[1].pointLon);
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
}
