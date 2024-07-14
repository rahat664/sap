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
import { provideNativeDateAdapter } from '@angular/material/core';
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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-trip-page.component.html',
  styleUrl: './create-trip-page.component.scss',
})
export class CreateTripPageComponent implements OnInit {
  goodsOptionsArray: CustomInputSelectModel[] = [];
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
  readonly maxDate = new Date(this._currentYear + 1, 11, 31);
  private time: any;
  loadingSuggestions: any;
  unloadingSuggestions: any;

  constructor(
    private service: TripService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private locationService: GeolocationService
  ) {}

  onCreateTrip() {}

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
  }

  private getVehicleTypeList() {
    this.service.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
    });
  }

  onVehicleTypeClick(item: any) {
    this.tripForm.get('categoryId').setValue(item.id);
    this.vehicleTypeList.forEach((element: any) => {
      element.selected = false;
    });
    item.selected = true;
  }

  goodsInputPlaceholder: string;
  goodsOpened: boolean;
  private _goodsOptionsArray: CustomInputSelectModel[];
  selectedDate: Date = new Date();
  loadingDistrictSuggestions: any;
  unloadingDistrictSuggestions: any;

  onClickPayment($event: boolean) {
    this.goodsOpened = $event;
  }

  onSelectPayment($event: number) {}

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
    this.service.cachedTruckCapacity.subscribe(truckCapacity => {
      this.truckCapacitySuggestions = truckCapacity;
    });
    this.service.cachedTruckSize.subscribe(truckSize => {
      this.truckSizeSuggestions = truckSize;
    });
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
    console.log($any);
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
      goodsId: ['', Validators.required],
      goodsName: ['', Validators.required],
      customerRate: [0, Validators.required],
      truckId: ['', Validators.required],
      note: [''],
      loadingPointDistrict: ['', Validators.required],
      loadingPointName: ['', Validators.required],
      unloadingPointDistrict: ['', Validators.required],
      unloadingPointName: ['', Validators.required],
      loadingPointLatitude: ['', Validators.required],
      loadingPointLongitude: ['', Validators.required],
      unloadingPointLatitude: ['', Validators.required],
      unloadingPointLongitude: ['', Validators.required],
    });
  }

  triggerResize() {}

  onSave() {}

  onDateChange($event: any) {}

  onSelect($event: any) {
    this.selectedDate = $event;
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
    this.tripForm.get('loadingPointName').setValue(option.name);
    if (option.district) {
      this.tripForm.get('loadingPointDistrict').setValue(option.district);
      this.tripForm.get('loadingPointDistrict').disable();
    } else {
      this.tripForm.get('loadingPointDistrict').enable();
    }

    if (option.latitude && option.longitude) {
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
    this.tripForm.get('unloadingPointName').setValue(option.name);
    if (option.district) {
      this.tripForm.get('unloadingPointDistrict').setValue('');
      this.tripForm.get('unloadingPointDistrict').setValue(option.district);
      this.tripForm.get('unloadingPointDistrict').disable();
    } else {
      this.tripForm.get('unloadingPointDistrict').enable();
    }
    if (option.latitude && option.longitude) {
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
      this.tripForm.get('loadingPointLatitude').setValue('');
      this.tripForm.get('loadingPointLongitude').setValue('');
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
    this.tripForm.get('loadingPointLatitude').setValue(option.lat);
    this.tripForm.get('loadingPointLongitude').setValue(option.lng);
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
    this.tripForm.get('unloadingPointLatitude').setValue(option.lat);
    this.tripForm.get('unloadingPointLongitude').setValue(option.lng);
    this.unloadingSuggestions = [];
  }
}
