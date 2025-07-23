import { Component, OnInit } from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatError, MatFormField } from '@angular/material/form-field';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { TripTemplate } from '../../models/trip-template.model';
import { TripService } from '../../services/trip.service';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { Router } from '@angular/router';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';
import { MyErrorStateMatcher } from '../template-create/template-create.component';
import { MatInput } from '@angular/material/input';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ScrollByButtonDirective } from '../../../../shared/directive/scroll-by-button.directive';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { paymentType, paymentTypes, tripType, tripTypes } from '../../../auth/models/response/trip';

@Component({
  selector: 'app-template-update',
  imports: [
    MatAutocomplete,
    MatError,
    MatFormField,
    ReactiveFormsModule,
    MatOption,
    MatInput,
    MatAutocompleteTrigger,
    NgClass,
    ScrollByButtonDirective,
    NgIf,
    NgForOf,
    FallbackImagePipe,
    ImageErrorDirective,
  ],
  templateUrl: './template-update.component.html',
  styleUrl: './template-update.component.scss',
})
export class TemplateUpdateComponent implements OnInit {
  matcher = new MyErrorStateMatcher();
  templateUpdateForm: FormGroup;
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
  templateId: string;

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
      this.templateUpdateForm
        .get('customerCode')
        .setValue(this.selectedCustomer.customerCode);
    }
    if (localStorage.getItem('templateEdit')) {
      this.templateId = JSON.parse(localStorage.getItem('templateEdit')).id;
      const template = JSON.parse(localStorage.getItem('templateEdit'));
      this.templateUpdateForm.get('name').setValue(template.name);
      this.templateUpdateForm
        .get('categoryId')
        .setValue(template.vehicleCategory?.id);
      this.templateUpdateForm.get('numOfTrucks').setValue(template.numOfTrucks);
      this.templateUpdateForm.get('truckSize').setValue(template.truckSize);
      this.templateUpdateForm
        .get('truckCapacityInTon')
        .setValue(template.truckCapacityInTon);
      this.templateUpdateForm.get('goodsId').setValue(template.good?.id);
      this.templateUpdateForm.get('goodsName').setValue(template.good?.name);
      this.templateUpdateForm.get('paymentType').setValue(template.paymentType);
      this.templateUpdateForm.get('tripType').setValue(template.tripType);
      this.tripTypes.forEach(tripType => {
        tripType.active = tripType.enumName === template.tripType;
      })
      this.paymentType.forEach(paymentType => {
        paymentType.active = false
        paymentType.active = paymentType.enumName === template.paymentType;
      })
      this.templateUpdateForm
        .get('customerRate')
        .setValue(template.customerRate);
      this.templateUpdateForm.get('note').setValue(template.note);
      const loadingPoints = template.points.filter(
        (point: any) => point.pointType === 'Loading'
      );
      const unloadingPoints = template.points.filter(
        (point: any) => point.pointType === 'Unloading'
      );

      loadingPoints?.forEach((point: any, index: number) => {
        if (index > 0) {
          this.addLoadingPoint();
        }
        if (point.id) {
          this.loadingPoints.controls[index].get('id').setValue(point.id);
        }
        this.loadingPoints.controls[index]
          .get('pointName')
          .setValue(point.pointName);
        this.loadingPoints.controls[index]
          .get('pointDistrict')
          .setValue(point.pointDistrict);
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
        if (point.id && point.id !== '') {
          this.unloadingPoints.controls[index].get('id').setValue(point.id);
        }
        this.unloadingPoints.controls[index]
          .get('pointName')
          .setValue(point.pointName);
        this.unloadingPoints.controls[index]
          .get('pointDistrict')
          .setValue(point.pointDistrict);
        this.unloadingPoints.controls[index]
          .get('pointLat')
          .setValue(point.pointLat);
        this.unloadingPoints.controls[index]
          .get('pointLon')
          .setValue(point.pointLon);
      });
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

  onUpdateTemplate() {
    if (this.templateUpdateForm.invalid) {
      this.templateUpdateForm.markAllAsTouched();
      this.handleToaster.showError('Please fill in all required fields');
      return;
    } else {
      this.tripTemplateData.name = this.templateUpdateForm.get('name').value;
      this.tripTemplateData.customerCode =
        this.templateUpdateForm.get('customerCode').value;
      this.tripTemplateData.categoryId =
        this.templateUpdateForm.get('categoryId').value;
      this.tripTemplateData.truckSize =
        this.templateUpdateForm.get('truckSize').value;
      this.tripTemplateData.numOfTrucks =
        this.templateUpdateForm.get('numOfTrucks').value;
      this.tripTemplateData.truckCapacityInTon =
        this.templateUpdateForm.get('truckCapacityInTon').value;
      this.tripTemplateData.goodsId =
        this.templateUpdateForm.get('goodsId').value;
      this.tripTemplateData.goodsName =
        this.templateUpdateForm.get('goodsName').value;
      this.tripTemplateData.customerRate =
        this.templateUpdateForm.get('customerRate').value;
      this.tripTemplateData.paymentType =
        this.templateUpdateForm.get('paymentType').value;
      this.tripTemplateData.tripType =
        this.templateUpdateForm.get('tripType').value;
      this.tripTemplateData.note = this.templateUpdateForm.get('note').value;
      this.tripTemplateData.points = [
        ...this.templateUpdateForm.get('loadingPoints').value,
        ...this.templateUpdateForm.get('unloadingPoints').value,
      ];
      this.checkCacheDataAndUpdate(
        this.tripTemplateData.numOfTrucks,
        this.tripTemplateData.truckSize,
        this.tripTemplateData.truckCapacityInTon
      );
      this.service
        .updateTemplate(this.templateId, this.tripTemplateData)
        .subscribe((res: any) => {
          if (res.status === 'OK') {
            this.handleToaster.showSuccess('Template updated successfully');
            localStorage.removeItem('templateEdit');
            localStorage.setItem('backFromTemplateEditOrUpdate', 'true');
            this.router.navigate(['/trip-create/customerselection']);
          }
        });
    }
  }

  onKeyUpLoadingPoint($event: KeyboardEvent, i: number) {
    const target = $event.target as HTMLInputElement;
    if (target.value.length > 1) {
      this.service
        .getLocationSuggestions(target.value, this.selectedCustomer?.customerCode)
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
        .getLocationSuggestions(target.value, this.selectedCustomer?.customerCode)
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

  onClickLeftButton() {
    this.leftButtonClicked = true;
    this.rightButtonClicked = false;
  }

  onClickRightButton() {
    this.rightButtonClicked = true;
    this.leftButtonClicked = false;
  }

  onVehicleTypeClick(item: any) {
    this.templateUpdateForm.get('categoryId').setValue(item.id);
    this.vehicleTypeList.forEach((element: any) => {
      element.selected = false;
    });
    item.selected = true;
  }

  onClickTruckSizeSuggestions(suggestion: any) {
    this.templateUpdateForm.get('truckSize').setValue(suggestion.value);
    this.truckSizeSuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckSize.next(this.truckSizeSuggestions);
  }

  onClickTruckCapacitySuggestions(suggestion: any) {
    this.templateUpdateForm
      .get('truckCapacityInTon')
      .setValue(suggestion.value);
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
    this.templateUpdateForm.get('goodsId').setValue(option.id);
    this.templateUpdateForm.get('goodsName').setValue(option.value);
  }

  private initiateForm() {
    this.templateUpdateForm = this.fb.group({
      name: [''],
      customerCode: [''],
      categoryId: [''],
      numOfTrucks: [''],
      truckSize: [''],
      truckCapacityInTon: [''],
      goodsId: [''],
      goodsName: [''],
      customerRate: [null],
      note: [''],
      paymentType: [''],
      tripType: [''],
      loadingPoints: this.fb.array([this.createLoadingPoint()]),
      unloadingPoints: this.fb.array([this.createUnloadingPoint()]),
      tripTemplateName: [''],
    });
  }

  private getVehicleTypeList() {
    this.service.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
      if (JSON.parse(localStorage.getItem('templateEdit'))) {
        const selectedTemplate = JSON.parse(
          localStorage.getItem('templateEdit')
        );
        this.vehicleTypeList.forEach((element: any) => {
          if (element.id == selectedTemplate.vehicleCategory.id) {
            element.selected = true;
          }
        });
      }
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
    this.templateUpdateForm.get('numOfTrucks').setValue(suggestion.value);
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
      id: [''],
      pointDistrict: [''],
      pointName: [''],
      pointLat: [''],
      pointLon: [''],
      pointType: ['Loading'],
    });
  }

  private createUnloadingPoint() {
    return this.fb.group({
      id: [''],
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
    return this.templateUpdateForm.get('loadingPoints') as FormArray;
  }

  addUnloadingPoint() {
    this.unloadingPoints.push(this.createUnloadingPoint());
  }

  get unloadingPoints() {
    return this.templateUpdateForm.get('unloadingPoints') as FormArray;
  }

  removeLoadingPoint(index: number) {
    this.loadingPoints.removeAt(index);
  }

  removeUnloadingPoint(index: number) {
    this.unloadingPoints.removeAt(index);
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  protected readonly tripTypes = tripTypes;
  protected readonly paymentType = paymentTypes;

  onTripTypeClick(type: tripType) {
    switch (type.id) {
      case 1:
        this.templateUpdateForm.get('tripType').setValue('COMMERCIAL');
        this.tripTypes.forEach(element => {
          element.active = element.id === 1;
        })
        break;
      case 2:
        this.templateUpdateForm.get('tripType').setValue('PROJECT');
        this.tripTypes.forEach(element => {
          element.active = element.id === 2;
        })
        break;
      default:
        this.templateUpdateForm.get('tripType').setValue('COMMERCIAL');
        break;
    }
  }

  onPaymentTypeClick(type: paymentType) {
    switch (type.id) {
      case 1:
        this.templateUpdateForm.get('paymentType').setValue('CASH');
        this.paymentType.forEach(element => {
          element.active = element.id === 1;
        })
        break;
      case 2:
        this.templateUpdateForm.get('paymentType').setValue('INVOICE');
        this.paymentType.forEach(element => {
          element.active = element.id === 2;
        })
        break;
      case 3:
        this.templateUpdateForm.get('paymentType').setValue('CASH_AND_INVOICE');
        this.paymentType.forEach(element => {
          element.active = element.id === 3;
        })
        break;
      case 4:
        this.templateUpdateForm.get('paymentType').setValue('COMMISSION');
        this.paymentType.forEach(element => {
          element.active = element.id === 4;
        })
        break;
      default:
        this.templateUpdateForm.get('paymentType').setValue('INVOICE');
        this.paymentType.forEach(element => {
          element.active = element.id === 2;
        })
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
