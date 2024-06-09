import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {manufacturerList} from "../models/manufacturer-list";
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {CustomInputSelectModel} from "../../../../../shared/modules/custom-input/custom-input-select.model";
import {TruckModel} from "../models/truck.model";

@Component({
  selector: 'app-truck-details',
  standalone: true,
  imports: [
    NgIf,
    UploadButtonComponent,
    CustomInputComponent,
    GetClickEventDirective,
    NgClass,
    NgForOf,
    DatePipe
  ],
  templateUrl: './truck-details.component.html',
  styleUrl: './truck-details.component.scss'
})
export class TruckDetailsComponent implements OnInit{
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
  singleTruck: TruckModel;
  documents: any[] = [];

  onClickManufacturer($event: boolean) {
    this.manufactureOpened = $event;
  }

  onSelectManuFacturer($event: number) {
    this.manufacturerPlaceholder = this.manufacturerList.find(x => x.id === $event).value;
    this.manufacturerList.forEach(x => x.selected = x.id === $event);
    this.manufactureOpened = false;
  }

  onSelectRegistrationype($event: number) {
    this.registrationTypePlaceholder = this.registrationListType.find(x => x.id === $event).value;
    this.registrationListType.forEach(x => x.selected = x.id === $event);
    this.registrationOpenedType = false;
  }

  onClickRegistrationType($event: boolean) {
    this.registrationOpenedType = $event;
  }

  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }

  onSelectRegistrationZone($event: number) {
    this.registrationZonePlaceholder = this.registrationZoneList.find(x => x.id === $event).value;
    this.registrationZoneList.forEach(x => x.selected = x.id === $event);
    this.registrationZoneOpened = false;
  }

  getFullRegistrationName() {
    return `${this.singleTruck.registration_zone} ${this.singleTruck.registration_category} ${this.singleTruck.registration_serial} ${this.singleTruck.registration_num}`
  }

  ngOnInit(): void {
    this.singleTruck = JSON.parse(localStorage.getItem('truck'));
    if (this.singleTruck.routePermitFile){
      this.documents.push({name: 'Route Permit', file: this.singleTruck.routePermitFile, expDate: this.singleTruck.routePermitExpDate});
    } if (this.singleTruck.fitnessCertFile){
      this.documents.push({name: 'Fitness Certificate', file: this.singleTruck.fitnessCertFile, expDate: this.singleTruck.fitnessCertExpDate});
    } if (this.singleTruck.taxFile){
      this.documents.push({name: 'Tax', file: this.singleTruck.taxFile, expDate: this.singleTruck.taxExpDate});
    }  if (this.singleTruck.caseFile){
      this.documents.push({name: 'Case', file: this.singleTruck.caseFile, expDate: this.singleTruck.caseExpDate});
    }  if (this.singleTruck.otherFile){
      this.documents.push({name: 'Other', file: this.singleTruck.otherFile, expDate: 'N/A'});
    }  if (this.singleTruck.regPaperFile){
      this.documents.push({name: 'Registration Paper', file: this.singleTruck.regPaperFile, expDate: 'N/A'});
    }  if (this.singleTruck.fitnessFile){
      this.documents.push({name: 'Fitness', file: this.singleTruck.fitnessFile, expDate: 'N/A'});
    }
    console.log(this.documents)
  }

  onClickEdit() {
    this.inEditMode = !this.inEditMode;
  }

  protected readonly Date = Date;
}
