import { Component } from '@angular/core';
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {NgClass, NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {FileUploadPopupComponent} from "../file-upload-popup/file-upload-popup.component";
import {manufacturerList} from "../models/manufacturer-list";
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import {registrationZoneList} from "../models/registration-zone";
import {registrationCategoryList} from "../models/registration-category";

@Component({
  selector: 'app-truck-add',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    NgIf,
    UploadButtonComponent,
    NgClass,
    FileUploadPopupComponent
  ],
  templateUrl: './truck-add.component.html',
  styleUrl: './truck-add.component.scss'
})
export class TruckAddComponent {

  onClickManufacturer($event: boolean) {

  }

  manufacturerList = manufacturerList;
  manufactureOpened: boolean;
  manufacturerPlaceholder: string;
  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened: boolean;
  registrationZonePlaceholder: string;
  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationOpenedType: boolean;
  registrationTypePlaceholder: string;

  onSelectManuFacturer($event: number) {

  }

  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }

  onSelectRegistrationZone($event: number) {

  }

  onClickRegistrationType($event: boolean) {
    this.registrationOpenedType = $event;
  }

  onSelectRegistrationype($event: number) {

  }
}
