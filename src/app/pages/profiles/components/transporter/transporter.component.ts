import {Component, OnInit} from '@angular/core';
import {CreatePopupComponent} from "../../../../shared/modal/create-popup/create-popup.component";
import {CustomerCreateComponent} from "../customer/customer-create/customer-create.component";
import {GetElementHeightDirective} from "../../../../shared/directive/get-element-height.directive";
import {GiveMaxHeightDirective} from "../../../../shared/directive/give-max-height.directive";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {UserModel} from "../../../user-management/models/user.model";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CustomInputComponent} from "../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../shared/directive/get-click-event.directive";
import {CustomInputSelectModel} from "../../../../shared/modules/custom-input/custom-input-select.model";
import {districts} from "./models/districts";
import {UserService} from "../../services/user.service";
import {TransporterAddComponent} from "./transporter-add/transporter-add.component";
import {LoadingComponent} from "../../../../shared/modules/loading/loading.component";

@Component({
  selector: 'app-transporter',
  standalone: true,
  imports: [
    CreatePopupComponent,
    CustomerCreateComponent,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    CustomInputComponent,
    GetClickEventDirective,
    TransporterAddComponent,
    LoadingComponent
  ],
  templateUrl: './transporter.component.html',
  styleUrl: './transporter.component.scss'
})
export class TransporterComponent implements OnInit{
  height = '';
  isOpen: boolean;
  districtFilter = 0;
  truckFilter = 0;
  districtInputPlaceholder: string;
  districtOptionsArray: CustomInputSelectModel[] = districts;
  districtOpened: boolean;
  transporterList: UserModel[] = [];
  loading: boolean;

  constructor(private service: UserService) {

  }

  onClickAddTransporter() {
    this.isOpen = true;
  }

  getFilterLength() {
    return this.districtFilter + this.truckFilter;
  }

  onClearFilter() {
    this.districtFilter = 0;
    this.truckFilter = 0;
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.loading = true;
    const value = ($event.target as HTMLInputElement).value;
    if (value.length > 0) {

    } else {
      this.getTransporterList();
    }
  }

  onClickSearchSuggestion(result: any) {

  }

  onClickDistrict($event: boolean) {
    this.districtOpened = $event;
  }

  onSelectDistrict($event: number) {
    this.districtFilter = 1;
    this.districtInputPlaceholder = this.districtOptionsArray.find(option => option.id === $event).value;
  }

  ngOnInit(): void {
    this.getTransporterList();
  }

  private getTransporterList() {
    this.loading = true;
    this.service.getUser('Transporter').subscribe((res: any) => {
      this.transporterList = res.data;
      this.loading = false;
    });
  }

  onClickTransporter($event: boolean) {
    this.isOpen = !$event;
    this.transporterList = [];
    this.getTransporterList();
  }
}
