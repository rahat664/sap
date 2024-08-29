import { Component, inject, OnInit } from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { UserModel } from '../../../../user-management/models/user.model';
import { FormGroup, FormsModule } from '@angular/forms';
import { CreatePopupComponent } from '../../../../../shared/modal/create-popup/create-popup.component';
import { FileUploadPopupComponent } from '../../truck/file-upload-popup/file-upload-popup.component';
import { driverFileType } from '../../customer/model/driver-file-type';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../../../../manage-trip/components/confirm-delete/confirm-delete.component';

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
  readonly dialog = inject(MatDialog);
  inEditMode = false;
  singleDriver: UserModel;
  documents: any[] = [];
  driverName: string;
  driverPhone: string;
  private driverUpdateForm: FormGroup;
  isUploadPopupOpen: boolean;
  newDriverFileType: any;
  closedDocument: any;

  constructor(private driverEditSharedService: DriverEditSharedService) {}

  ngOnInit(): void {
    localStorage.removeItem('previousDriverDocument');
    this.driverEditSharedService.isUploadPopupOpen.subscribe(res => {
      this.isUploadPopupOpen = res;
    });
    this.documents = [];
    this.singleDriver = JSON.parse(localStorage.getItem('driver'));
    this.driverEditSharedService.bindDriverValueWithForm(this.singleDriver);
    this.documents = this.driverEditSharedService.getDocument(
      this.singleDriver
    );
    this.driverName = this.driverEditSharedService.driverName;
    this.driverPhone = this.driverEditSharedService.driverPhone;
    localStorage.setItem(
      'previousDriverDocument',
      JSON.stringify(this.documents)
    );
    this.driverFileTypeModify(this.documents);
  }

  onDriverUpdate() {
    this.driverEditSharedService.onDriverUpdate(
      this.driverName,
      this.driverPhone
    );
  }

  protected readonly driverFileType = driverFileType;
  isNewOpen: boolean = false;
  isConfirmModalOpen: boolean;
  fileName: string;

  onClickCloseButton(document: any) {
    this.fileName = document.name;
    this.closedDocument = document;
    this.dialog
      .open(ConfirmDeleteComponent, {
        width: '21.875rem',
        data: {
          title: 'Delete Document',
          text: 'Are you sure you want to delete this document?',
        },
      })
      .afterClosed()
      .subscribe(res => {
        if (res === 'deleted') {
          this.performRemove(res);
        }
      });
  }

  onChangeFile($event: any) {
    this.driverEditSharedService.onChangeFile($event);
  }

  private driverFileTypeModify(documents: any[]) {
    // make a copy of the documents array with true copy not shallow copy
    this.newDriverFileType = JSON.parse(JSON.stringify(this.driverFileType));
    documents.forEach(document => {
      this.newDriverFileType = this.newDriverFileType.filter(
        item => item.value !== document.name
      );
    });
  }

  performRemove($event: any) {
    this.isConfirmModalOpen = false;
    this.driverEditSharedService.onClickCloseButton(this.closedDocument);
    this.documents = this.driverEditSharedService.documents;
    this.driverFileTypeModify(this.documents);
  }

  onClickCancel() {
    this.inEditMode = false;
    this.documents = [];
    this.documents = JSON.parse(localStorage.getItem('previousDriverDocument'));
    localStorage.removeItem('previousDriverDocument');
  }

  onEditClick() {
    this.inEditMode = true;
    this.driverEditSharedService.closeInputSelect.next(false);
  }

  onCLickUpload() {
    // filter newDriverFileType to remove the documents that are already uploaded
    // shalow copy of the driverFileType
    this.driverFileTypeModify(this.documents);
    this.dialog
      .open(FileUploadPopupComponent, {
        width: '40%',
        data: {
          filetype: this.newDriverFileType,
          isFromDriver: true,
          value: this.singleDriver,
        },
      })
      .afterClosed()
      .subscribe(res => {
        if (res != 'close') {
          this.onChangeFile(res);
          this.documents = this.driverEditSharedService.documents;
        }
      });
  }
}
