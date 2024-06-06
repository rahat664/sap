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
import {HttpClient} from "@angular/common/http";
import {TruckService} from "./services/truck.service";
import {RouterLink} from "@angular/router";
import {UploadButtonComponent} from "../../../../shared/modules/upload-button/upload-button.component";
import {CustomInputSelectModel} from "../../../../shared/modules/custom-input/custom-input-select.model";
import {manufacturerList} from "./models/manufacturer-list";
import {FileUploadPopupComponent} from "./file-upload-popup/file-upload-popup.component";

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
    FileUploadPopupComponent
  ],
  templateUrl: './truck.component.html',
  styleUrl: './truck.component.scss'
})
export class TruckComponent implements OnInit{
  height: string = '';
  truckList: TruckModel[] = [];
  manufactureOpened: boolean;
  manufacturerList: CustomInputSelectModel[] = manufacturerList
  manufacturerPlaceholder: string = '';
  trackerName: string;
  trackerAddOpened: boolean = false;
  selectedTruckId: number;
  isOpen: boolean = false;

  constructor(private service: TruckService) {
  }


  ngOnInit(): void {
    this.getTruckList();
  }

  private getTruckList() {
    this.service.getTruckList().subscribe((res: any) => {
      this.truckList = res.data;
      res.data.forEach((truck: TruckModel) => {
        this.getPreHireCheckList(truck.id);
      });
    });
  }

  getFullRegistrationName(truck: TruckModel) {
    return `${truck.registration_zone} ${truck.registration_category} ${truck.registration_serial} ${truck.registration_num}`
  }

  getPreHireCheckList(id: number): void{
    this.service.getPreHireChecklist(id).subscribe((res: any) => {
      const truck = this.truckList.find((truck: TruckModel) => truck.id === id);
      const passedPreHireChecklist = res.data.filter((checklist: any) => checklist.status === 'PASS');
      truck.preHireChecklist = `${passedPreHireChecklist.length}/${res.data.length}`;
    });
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
}
