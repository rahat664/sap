import { Component, Input, OnInit } from '@angular/core';
import { CustomDatePickerComponent } from '../../../../shared/modules/custom-date-picker/custom-date-picker.component';
import { ButtonChipsComponent } from '../../modules/button-chips/button-chips.component';
import { NgForOf, NgIf } from '@angular/common';
import { ScrollByButtonDirective } from '../../../../shared/directive/scroll-by-button.directive';
import { TripService } from '../../services/trip.service';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-trip-page',
  standalone: true,
  imports: [
    CustomDatePickerComponent,
    ButtonChipsComponent,
    NgForOf,
    NgIf,
    ScrollByButtonDirective,
    CustomInputComponent,
    GetClickEventDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './create-trip-page.component.html',
  styleUrl: './create-trip-page.component.scss',
})
export class CreateTripPageComponent implements OnInit {
  goodsOptionsArray: CustomInputSelectModel[] = [];

  @Input() template: any;
  @Input() customerName: string;
  @Input() templateEnabled: boolean = false;
  vehicleTypeList: any;

  constructor(private service: TripService) {}

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
      console.log(this.goodsOptionsArray);
    });
  }
}
