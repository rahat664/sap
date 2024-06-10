import {Component, OnInit} from '@angular/core';
import {CreatePopupComponent} from "../../../../shared/modal/create-popup/create-popup.component";
import {CustomInputComponent} from "../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../shared/directive/get-click-event.directive";
import {GetElementHeightDirective} from "../../../../shared/directive/get-element-height.directive";
import {GiveMaxHeightDirective} from "../../../../shared/directive/give-max-height.directive";
import {NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {TransporterAddComponent} from "../transporter/transporter-add/transporter-add.component";
import {TruckModel} from "./models/truck.model";
import {TruckService} from "./services/truck.service";
import {RouterLink} from "@angular/router";
import {UploadButtonComponent} from "../../../../shared/modules/upload-button/upload-button.component";
import {CustomInputSelectModel} from "../../../../shared/modules/custom-input/custom-input-select.model";
import {manufacturerList} from "./models/manufacturer-list";
import {FileUploadPopupComponent} from "./file-upload-popup/file-upload-popup.component";
import {TruckInnerModel} from "./models/truck-inner.model";
import {LoadingComponent} from "../../../../shared/modules/loading/loading.component";

@Component({
  selector: 'app-truck',
  standalone: true,
  imports: [
    CreatePopupComponent,
    CustomInputComponent,
    GetClickEventDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    TransporterAddComponent,
    RouterLink,
    UploadButtonComponent,
    FileUploadPopupComponent,
    LoadingComponent
  ],
  templateUrl: './truck.component.html',
  styleUrl: './truck.component.scss'
})
export class TruckComponent implements OnInit{
  height: string = '';
  truckList: TruckInnerModel[] = [];
  manufactureOpened: boolean;
  manufacturerList: CustomInputSelectModel[] = manufacturerList
  manufacturerPlaceholder: string = '';
  trackerAddOpened: boolean = false;
  selectedTruckId: number;
  isOpen: boolean = false;
  preHireCheckList: any[] = [];
  loading: boolean;

  constructor(private service: TruckService) {
  }


  ngOnInit(): void {
    this.getTruckList();
  }

  private getTruckList() {
    this.loading = true;
    this.service.getTruckList().subscribe((res: any) => {
      res.data.forEach((truck: TruckModel) => {
        truck.truck.preHireCheckList = truck.preHireChecklistList;
        this.truckList.push(truck.truck);
      });
      this.loading = false;
    });
  }

  getFullRegistrationName(truck: any) {
    return `${truck.registration_zone} ${truck.registration_category} ${truck.registration_serial} ${truck.registration_num}`
  }


  onClickManufacturer($event: boolean) {
    this.manufactureOpened = $event;
  }

  onSelectManuFacturer($event: number) {
    this.manufacturerPlaceholder = this.manufacturerList.find((manufacturer: CustomInputSelectModel) => manufacturer.id === $event).value;
  }

  onClickAddTracker(id: number) {
    if (id === this.selectedTruckId) {
      this.trackerAddOpened = !this.trackerAddOpened;
    } else {
      this.trackerAddOpened = true;
    }
    this.selectedTruckId = id;
  }

  onClickAddTruckerSave() {
    this.trackerAddOpened = false;
  }

  onClickTruckDetails(truck: TruckInnerModel) {
    localStorage.removeItem('truck');
    localStorage.setItem('truck', JSON.stringify(truck));
  }
}
