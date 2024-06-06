import { Component } from '@angular/core';
import {NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {FileUploadPopupComponent} from "../../truck/file-upload-popup/file-upload-popup.component";

@Component({
  selector: 'app-driver-add',
  standalone: true,
  imports: [
    NgIf,
    UploadButtonComponent,
    FileUploadPopupComponent
  ],
  templateUrl: './driver-add.component.html',
  styleUrl: './driver-add.component.scss'
})
export class DriverAddComponent {

}
