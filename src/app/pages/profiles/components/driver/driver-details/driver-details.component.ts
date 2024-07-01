import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { UserModel } from '../../../../user-management/models/user.model';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CreatePopupComponent } from '../../../../../shared/modal/create-popup/create-popup.component';
import { FileUploadPopupComponent } from '../../truck/file-upload-popup/file-upload-popup.component';
import { driverFileType } from '../../customer/model/driver-file-type';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';

@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    NgIf,
    UploadButtonComponent,
    NgClass,
    NgForOf,
    FormsModule,
    CreatePopupComponent,
    FileUploadPopupComponent,
    DatePipe,
  ],
  templateUrl: './driver-details.component.html',
  styleUrl: './driver-details.component.scss',
})
export class DriverDetailsComponent implements OnInit {
  inEditMode = false;
  singleDriver: UserModel;
  documents: any[] = [];
  driverName: string;
  driverPhone: string;
  private driverUpdateForm: FormGroup;
  isUploadPopupOpen: boolean;
  newDriverFileType: any;

  constructor(private driverEditSharedService: DriverEditSharedService) {}

  ngOnInit(): void {
    this.documents = [];
    this.singleDriver = JSON.parse(localStorage.getItem('driver'));
    this.driverEditSharedService.bindDriverValueWithForm(this.singleDriver);
    this.documents = this.driverEditSharedService.getDocument(
      this.singleDriver
    );
    this.driverName = this.driverEditSharedService.driverName;
    this.driverPhone = this.driverEditSharedService.driverPhone;
    this.driverFileTypeModify(this.documents);
  }

  onDriverUpdate() {
    this.driverEditSharedService.onDriverUpdate(
      this.driverName,
      this.driverPhone
    );
  }
  protected readonly driverFileType = driverFileType;

  onClickCloseButton(document: any) {
    this.driverEditSharedService.onClickCloseButton(document);
    this.documents = this.driverEditSharedService.documents;
    this.driverFileTypeModify(this.documents);
  }

  onChangeFile($event: any) {
    this.driverEditSharedService.onChangeFile($event);
  }

  private driverFileTypeModify(documents: any[]) {
    // make a copy of the documents array with true copy not shallow copy
    this.newDriverFileType = JSON.parse(JSON.stringify(this.driverFileType));
    documents.forEach((document) => {
      this.newDriverFileType = this.newDriverFileType.filter(
        (item) => item.value !== document.name,
      );
    });
  }
}
