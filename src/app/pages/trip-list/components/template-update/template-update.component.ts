import { Component } from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatError, MatFormField } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-template-update',
  standalone: true,
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
  ],
  templateUrl: './template-update.component.html',
  styleUrl: './template-update.component.scss',
})
export class TemplateUpdateComponent {
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
      this.templateUpdateForm
        .get('customerRate')
        .setValue(template.customerRate);
      this.templateUpdateForm.get('note').setValue(template.note);
      this.templateUpdateForm
        .get('loadingPointDistrict')
        .setValue(template.points[0].pointDistrict);
      this.templateUpdateForm
        .get('loadingPointName')
        .setValue(template.points[0].pointName);
      this.templateUpdateForm
        .get('unloadingPointDistrict')
        .setValue(template.points[1].pointDistrict);
      this.templateUpdateForm
        .get('unloadingPointName')
        .setValue(template.points[1].pointName);
      this.templateUpdateForm
        .get('loadingPointLatitude')
        .setValue(template.points[0].pointLat);
      this.templateUpdateForm
        .get('loadingPointLongitude')
        .setValue(template.points[0].pointLon);
      this.templateUpdateForm
        .get('unloadingPointLatitude')
        .setValue(template.points[1].pointLat);
      this.templateUpdateForm
        .get('unloadingPointLongitude')
        .setValue(template.points[1].pointLon);
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
      this.tripTemplateData.note = this.templateUpdateForm.get('note').value;
      this.tripTemplateData.points = [
        {
          pointDistrict: this.templateUpdateForm.get('loadingPointDistrict')
            .value,
          pointName: this.templateUpdateForm.get('loadingPointName').value,
          pointLat: Number(
            this.templateUpdateForm.get('loadingPointLatitude').value
          ),
          pointLon: Number(
            this.templateUpdateForm.get('loadingPointLongitude').value
          ),
          pointType: 'loading',
        },
        {
          pointDistrict: this.templateUpdateForm.get('unloadingPointDistrict')
            .value,
          pointName: this.templateUpdateForm.get('unloadingPointName').value,
          pointLat: Number(
            this.templateUpdateForm.get('unloadingPointLatitude').value
          ),
          pointLon: Number(
            this.templateUpdateForm.get('unloadingPointLongitude').value
          ),
          pointType: 'unloading',
        },
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
      this.templateUpdateForm.get('loadingPointDistrict').enable();
      this.templateUpdateForm.get('loadingPointDistrict').setValue('');
      this.templateUpdateForm.get('loadingPointLatitude').setValue('');
      this.templateUpdateForm.get('loadingPointLongitude').setValue('');
    }
  }

  onClickLoadingSuggestion(option: any) {
    option.locationPointName
      ? this.templateUpdateForm
          .get('loadingPointName')
          .setValue(option.locationPointName)
      : this.templateUpdateForm
          .get('loadingPointName')
          .setValue(option.addressText);
    if (option.district) {
      this.templateUpdateForm
        .get('loadingPointDistrict')
        .setValue(option.district);
    } else {
      for (let i = 0; i < this.district.length; i++) {
        if (option.addressText.includes(this.district[i].name)) {
          this.templateUpdateForm
            .get('loadingPointDistrict')
            .setValue(this.district[i].name);
          break;
        } else {
          this.templateUpdateForm.get('loadingPointDistrict').enable();
        }
      }
    }

    if (option.latitude > 0 && option.longitude > 0) {
      this.templateUpdateForm
        .get('loadingPointLatitude')
        .setValue(option.latitude);
      this.templateUpdateForm
        .get('loadingPointLongitude')
        .setValue(option.longitude);
    } else {
      this.locationService.getLatLong(option.placeId).subscribe((res: any) => {
        const lat = res.location.latitude;
        const lng = res.location.longitude;
        this.templateUpdateForm.get('loadingPointLatitude').setValue(lat);
        this.templateUpdateForm.get('loadingPointLongitude').setValue(lng);
      });
    }
    this.loadingSuggestions = [];
  }

  onClickUnloadingSuggestion(option: any) {
    this.templateUpdateForm
      .get('unloadingPointName')
      .setValue(
        option.locationPointName ? option.locationPointName : option.addressText
      );
    if (option.district) {
      this.templateUpdateForm.get('unloadingPointDistrict').setValue('');
      this.templateUpdateForm
        .get('unloadingPointDistrict')
        .setValue(option.district);
    } else {
      for (let i = 0; i < this.district.length; i++) {
        if (option.addressText.includes(this.district[i].name)) {
          this.templateUpdateForm
            .get('unloadingPointDistrict')
            .setValue(this.district[i].name);
          break;
        } else {
          this.templateUpdateForm.get('unloadingPointDistrict').enable();
        }
      }
    }
    if (option.latitude > 0 && option.longitude > 0) {
      this.templateUpdateForm
        .get('unloadingPointLatitude')
        .setValue(option.latitude);
      this.templateUpdateForm
        .get('unloadingPointLongitude')
        .setValue(option.longitude);
    } else {
      this.locationService.getLatLong(option.placeId).subscribe((res: any) => {
        this.templateUpdateForm
          .get('unloadingPointLatitude')
          .setValue(res?.location?.latitude);
        this.templateUpdateForm
          .get('unloadingPointLongitude')
          .setValue(res?.location?.longitude);
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
      this.templateUpdateForm.get('unloadingPointDistrict').enable();
      this.templateUpdateForm.get('unloadingPointDistrict').setValue('');
      this.templateUpdateForm.get('unloadingPointLatitude').setValue('');
      this.templateUpdateForm.get('unloadingPointLongitude').setValue('');
    }
  }

  onKeyUpLoadingDistrict($event: KeyboardEvent) {
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

  onSelectLoadingDistrict(option: any) {
    this.templateUpdateForm.get('loadingPointDistrict').setValue(option.name);
    if (
      this.templateUpdateForm.get('loadingPointLatitude').value === '' ||
      this.templateUpdateForm.get('loadingPointLongitude').value === ''
    ) {
      this.templateUpdateForm
        .get('loadingPointLatitude')
        .setValue(
          this.templateUpdateForm.get('loadingPointLatitude').value
            ? this.templateUpdateForm.get('loadingPointLatitude').value
            : option.lat
        );
      this.templateUpdateForm
        .get('loadingPointLongitude')
        .setValue(
          this.templateUpdateForm.get('loadingPointLongitude').value
            ? this.templateUpdateForm.get('loadingPointLongitude').value
            : option.lon
        );
    }
    this.loadingDistrictSuggestions = [];
  }

  onKeyUpUnloadingDistrict($event: KeyboardEvent) {
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

  onSelectUnloadingDistrict(option: any) {
    this.templateUpdateForm.get('unloadingPointDistrict').setValue(option.name);
    if (
      this.templateUpdateForm.get('unloadingPointLatitude').value === '' ||
      this.templateUpdateForm.get('unloadingPointLongitude').value === ''
    ) {
      this.templateUpdateForm
        .get('unloadingPointLatitude')
        .setValue(
          this.templateUpdateForm.get('unloadingPointLatitude').value
            ? this.templateUpdateForm.get('unloadingPointLatitude').value
            : option.lat
        );
      this.templateUpdateForm
        .get('unloadingPointLongitude')
        .setValue(
          this.templateUpdateForm.get('unloadingPointLongitude').value
            ? this.templateUpdateForm.get('unloadingPointLongitude').value
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
      loadingPointDistrict: [''],
      loadingPointName: [''],
      unloadingPointDistrict: [''],
      unloadingPointName: [''],
      loadingPointLatitude: [''],
      loadingPointLongitude: [''],
      unloadingPointLatitude: [''],
      unloadingPointLongitude: [''],
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

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

}
