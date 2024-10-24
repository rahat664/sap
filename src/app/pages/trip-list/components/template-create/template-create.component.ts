import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatCalendar, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatCard } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatError,
  MatFormField,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatMenu } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { ScrollByButtonDirective } from '../../../../shared/directive/scroll-by-button.directive';
import { TimePickerComponent } from '../../../../shared/modules/time-picker/time-picker.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { TripService } from '../../services/trip.service';
import { Router } from '@angular/router';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { TripTemplate } from '../../models/trip-template.model';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-template-create',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatButton,
    MatCalendar,
    MatCard,
    MatCheckbox,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    MatMenu,
    MatOption,
    MatSuffix,
    CommonModule,
    ReactiveFormsModule,
    ScrollByButtonDirective,
    TimePickerComponent,
    MatError,
  ],
  templateUrl: './template-create.component.html',
  styleUrl: './template-create.component.scss',
})
export class TemplateCreateComponent {
  matcher = new MyErrorStateMatcher();
  templateForm: FormGroup;
  loadingSuggestions: any;
  loadingDistrictSuggestions: any;
  unloadingSuggestions: any;
  unloadingDistrictSuggestions: any;
  scrollable: any;
  rightButtonClicked: any;
  leftButtonClicked: boolean;
  vehicleTypeList: any;
  truckSizeSuggestions: any;
  truckCapacitySuggestions: any;
  loadingGoodsSuggestions: any;
  goodsOptionsArray: CustomInputSelectModel[] = [];
  selectedCustomer: any;
  customerName: any;
  district: any;
  tripTemplateData: TripTemplate = new TripTemplate();
  numberOfTrucksSuggestions: any;

  constructor(
    private service: TripService,
    private handleToaster: HandleToastrService,
    private router: Router,
    private locationService: GeolocationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initiateForm();
    this.getVehicleTypeList();
    this.getGoodsOptions();
    this.getCachedData();
    this.getDistrict();
    this.selectedCustomer = JSON.parse(
      localStorage.getItem('selectedCustomer')
    );
    if (this.selectedCustomer) {
      this.customerName = this.selectedCustomer.name;
      this.templateForm
        .get('customerCode')
        .setValue(this.selectedCustomer.customerCode);
    }
  }

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

  onCreateTemplate() {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      this.handleToaster.showError('Please fill in all required fields');
      return;
    } else {
      this.tripTemplateData.name = this.templateForm.get('name').value;
      this.tripTemplateData.customerCode =
        this.templateForm.get('customerCode').value;
      this.tripTemplateData.categoryId =
        this.templateForm.get('categoryId').value;
      this.tripTemplateData.truckSize =
        this.templateForm.get('truckSize').value;
      this.tripTemplateData.numOfTrucks =
        this.templateForm.get('numOfTrucks').value;
      this.tripTemplateData.truckCapacityInTon =
        this.templateForm.get('truckCapacityInTon').value;
      this.tripTemplateData.goodsId = this.templateForm.get('goodsId').value;
      this.tripTemplateData.goodsName =
        this.templateForm.get('goodsName').value;
      this.tripTemplateData.customerRate =
        this.templateForm.get('customerRate').value;
      this.tripTemplateData.note = this.templateForm.get('note').value;
      this.tripTemplateData.points = [
        ...this.templateForm.get('loadingPoints').value,
        ...this.templateForm.get('unloadingPoints').value,
      ];
      this.checkCacheDataAndUpdate(
        this.tripTemplateData.numOfTrucks,
        this.tripTemplateData.truckSize,
        this.tripTemplateData.truckCapacityInTon
      );
      this.service
        .postTripTemplate(this.tripTemplateData)
        .subscribe((res: any) => {
          if (res.status === 'OK') {
            this.handleToaster.showSuccess('Template created successfully');
            this.router.navigate(['/trip-create/customerselection']);
          }
        });
    }
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
        console.log(option.addressText);
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


  onClickLeftButton() {
    this.leftButtonClicked = true;
    this.rightButtonClicked = false;
  }

  onClickRightButton() {
    this.rightButtonClicked = true;
    this.leftButtonClicked = false;
  }

  onVehicleTypeClick(item: any) {
    this.templateForm.get('categoryId').setValue(item.id);
    this.vehicleTypeList.forEach((element: any) => {
      element.selected = false;
    });
    item.selected = true;
  }

  onClickTruckSizeSuggestions(suggestion: any) {
    this.templateForm.get('truckSize').setValue(suggestion.value);
    this.truckSizeSuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckSize.next(this.truckSizeSuggestions);
  }

  onClickTruckCapacitySuggestions(suggestion: any) {
    this.templateForm.get('truckCapacityInTon').setValue(suggestion.value);
    this.truckCapacitySuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckCapacity.next(this.truckCapacitySuggestions);
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

  onClickGoodsSuggestion(option: any) {
    this.templateForm.get('goodsId').setValue(option.id);
    this.templateForm.get('goodsName').setValue(option.value);
  }

  private initiateForm() {
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      customerCode: ['', Validators.required],
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
      tripTemplateName: [''],
    });
  }

  private getVehicleTypeList() {
    this.service.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
    });
  }

  private getCachedData() {
    this.truckSizeSuggestions = JSON.parse(localStorage.getItem('truckSize'));
    this.truckCapacitySuggestions = JSON.parse(
      localStorage.getItem('truckCapacity')
    );
    this.numberOfTrucksSuggestions = JSON.parse(
      localStorage.getItem('noOfTrucks')
    );
  }

  onClickNoOfTruckSuggestion(suggestion: any) {
    this.templateForm.get('numOfTrucks').setValue(suggestion.value);
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

  private getDistrict() {
    this.service.getDistricts().subscribe((res: any) => {
      this.district = res.data;
    });
  }

  private createLoadingPoint() {
    return this.fb.group({
      pointDistrict: [''],
      pointName: [''],
      pointLat: [''],
      pointLon: [''],
      pointType: ['Loading'],
    });
  }

  private createUnloadingPoint() {
    return this.fb.group({
      pointDistrict: [''],
      pointName: [''],
      pointLat: [''],
      pointLon: [''],
      pointType: ['Unloading'],
    });
  }

  addLoadingPoint() {
    this.loadingPoints.push(this.createLoadingPoint());
  }

  get loadingPoints() {
    return this.templateForm.get('loadingPoints') as FormArray;
  }

  addUnloadingPoint() {
    this.unloadingPoints.push(this.createUnloadingPoint());
  }

  get unloadingPoints() {
    return this.templateForm.get('unloadingPoints') as FormArray;
  }

  removeLoadingPoint(index: number) {
    this.loadingPoints.removeAt(index);
  }

  removeUnloadingPoint(index: number) {
    this.unloadingPoints.removeAt(index);
  }
}
