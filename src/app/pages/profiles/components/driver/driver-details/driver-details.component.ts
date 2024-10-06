import { Component, inject, OnInit } from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { UserModel } from '../../../../user-management/models/user.model';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CreatePopupComponent } from '../../../../../shared/modal/create-popup/create-popup.component';
import { FileUploadPopupComponent } from '../../truck/file-upload-popup/file-upload-popup.component';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import {
  DriverFileType,
  driverFileTypeModel,
} from '../../truck/models/driver-file-type';

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
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatDatepicker,
    MatMenu,
    MatMenuTrigger,
    MatDatepickerToggle,
    MatDatepickerInput,
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
  protected driverUpdateForm: FormGroup;
  isUploadPopupOpen: boolean;
  newDriverFileType: any;
  closedDocument: any;

  constructor(
    private driverEditSharedService: DriverEditSharedService,
    private fb: FormBuilder
  ) {
    this.driverUpdateForm = this.fb.group({
      driverName: [{ value: '', disabled: true }],
      driverPhone: [{ value: '', disabled: true }],
    });
  }

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
    this.driverName = this.driverUpdateForm.get('driverName').value;
    this.driverPhone = this.driverUpdateForm.get('driverPhone').value;
    this.driverEditSharedService.onDriverUpdate(
      this.driverName,
      this.driverPhone
    );
  }

  protected readonly driverFileType: DriverFileType[] = driverFileTypeModel;
  isNewOpen: boolean = false;
  isConfirmModalOpen: boolean;
  fileName: string;
  viewMoreFormControlName: string;
  isInEditMode: any;
  viewMoreExpiryControlName: string;
  driverDetails: UserModel;
  loading: boolean;

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
    this.driverUpdateForm.get('driverName').enable();
    this.driverUpdateForm.get('driverPhone').enable();
    this.driverUpdateForm.get('driverName').setValue(this.driverName);
    this.driverUpdateForm.get('driverPhone').setValue(this.driverPhone);
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

  getSavedFileArray(viewMoreFormControlName: any) {
    return [] as any;
  }

  getDriverImageTitle(viewMoreFormControlName) {
    return '';
  }

  onClickClosePopUp() {}

  onClickImage(preSignedFileUrl: any) {}

  onCloseImageSavedImage(viewMoreFormControlName, file: any) {}

  onCloseImage(
    viewMoreFormControlName,
    file: any,
    viewMoreExpiryControlName: any
  ) {}

  getFileArray(viewMoreFormControlName) {
    return [] as any;
  }

  getSpecificFiles(formControlName: any, max?: any) {
    return [] as any;
  }

  triggerFileUpload(formControlName: any, max: any) {}

  onFileSelected($event: Event) {}

  checkThatFileIsAvailableOrNot(name) {
    return [] as any;
  }

  onDateChange($event: Event, expiryFormControlName: any) {}

  checkDateIsExpiredOrNot(expiryDate: any) {
    return {
      isExpired: false,
      text: '',
    };
  }

  onClickSave() {}

  onClickApprove() {}

  onClickReject() {}

  onClickEdit() {}
}
