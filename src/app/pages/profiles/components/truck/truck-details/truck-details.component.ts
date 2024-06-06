import { Component } from '@angular/core';
import {NgClass, NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {manufacturerList} from "../models/manufacturer-list";
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {CustomInputSelectModel} from "../../../../../shared/modules/custom-input/custom-input-select.model";

@Component({
  selector: 'app-truck-details',
  standalone: true,
  imports: [
    NgIf,
    UploadButtonComponent,
    CustomInputComponent,
    GetClickEventDirective,
    NgClass
  ],
  templateUrl: './truck-details.component.html',
  styleUrl: './truck-details.component.scss'
})
export class TruckDetailsComponent {
  inEditMode: boolean = false;
  manufacturerList: CustomInputSelectModel[] = manufacturerList;
  manufactureOpened: boolean;
  manufacturerPlaceholder: string;
  registrationTypePlaceholder: string;
  registrationOpenedType: boolean;
  registrationListType: CustomInputSelectModel[];
  registrationZoneList: CustomInputSelectModel[];
  registrationZoneOpened: boolean;
  registrationZonePlaceholder: string;

  onClickManufacturer($event: boolean) {

  }

  onSelectManuFacturer($event: number) {

  }

  onSelectRegistrationype($event: number) {

  }

  onClickRegistrationType($event: boolean) {

  }

  onClickRegistrationZone($event: boolean) {

  }

  onSelectRegistrationZone($event: number) {

  }
}
