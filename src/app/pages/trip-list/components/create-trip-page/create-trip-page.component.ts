import { Component, Input, OnInit } from '@angular/core';
import { CustomDatePickerComponent } from '../../../../shared/modules/custom-date-picker/custom-date-picker.component';
import { ButtonChipsComponent } from '../../modules/button-chips/button-chips.component';
import { CommonModule } from '@angular/common';
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
  ],
  templateUrl: './create-trip-page.component.html',
  styleUrl: './create-trip-page.component.scss',
})
export class CreateTripPageComponent implements OnInit {
  goodsOptionsArray: CustomInputSelectModel[] = [];
  tripForm: FormGroup;

  @Input() template: any;
  @Input() customerName: string;
  @Input() templateEnabled: boolean = false;
  vehicleTypeList: any;
  truckCapacitySuggestions: any[];
  truckSizeSuggestions: any[];
  saveTemplateInputEnabled: boolean;

  constructor(
    private service: TripService,
    private fb: FormBuilder
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
    this.vehicleTypeList.forEach((element: any) => {
      element.selected = false;
    });
    item.selected = true;
  }

  goodsInputPlaceholder: string;
  goodsOpened: boolean;
  private _goodsOptionsArray: CustomInputSelectModel[];

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
    this.truckCapacitySuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckCapacity.next(this.truckCapacitySuggestions);
  }

  onClickTruckSizeSuggestions(suggestion: any) {
    this.truckSizeSuggestions.forEach(suggestions => {
      suggestions.selected = suggestions.value === suggestion.value;
    });
    this.service.cachedTruckSize.next(this.truckSizeSuggestions);
  }

  toggleSaveAsTemplateInputField($any: any) {
    this.saveTemplateInputEnabled = $any.target.checked;
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
      customerRate: [0, Validators.required],
      truckId: ['', Validators.required],
      note: [''],
      loadingPointDistrict: ['', Validators.required],
      loadingPointName: ['', Validators.required],
      unloadingPointDistrict: ['', Validators.required],
      unloadingPointName: ['', Validators.required],
    });
  }
}
