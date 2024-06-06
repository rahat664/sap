import {Component, OnInit} from '@angular/core';
import {CreatePopupComponent} from "../../../../shared/modal/create-popup/create-popup.component";
import {CustomInputComponent} from "../../../../shared/modules/custom-input/custom-input.component";
import {FileUploadPopupComponent} from "../truck/file-upload-popup/file-upload-popup.component";
import {GetClickEventDirective} from "../../../../shared/directive/get-click-event.directive";
import {GetElementHeightDirective} from "../../../../shared/directive/get-element-height.directive";
import {GiveMaxHeightDirective} from "../../../../shared/directive/give-max-height.directive";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {UploadButtonComponent} from "../../../../shared/modules/upload-button/upload-button.component";
import {UserModel} from "../../../user-management/models/user.model";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-driver',
  standalone: true,
    imports: [
        CreatePopupComponent,
        CustomInputComponent,
        FileUploadPopupComponent,
        GetClickEventDirective,
        GetElementHeightDirective,
        GiveMaxHeightDirective,
        NgForOf,
        NgIf,
        RouterLink,
        UploadButtonComponent
    ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss'
})
export class DriverComponent implements OnInit{
  isOpen: boolean;
  driverList: UserModel[] = [];
  height: string;

  constructor(private user: UserService) {
  }

  ngOnInit(): void {
    this.getDriverList();
  }

  private getDriverList() {
    this.user.getUser('Driver').subscribe((res: any) => {
      this.driverList = res.data;
    });
  }
}
