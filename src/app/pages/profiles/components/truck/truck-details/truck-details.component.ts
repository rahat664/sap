import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { registrationCategoryList } from '../models/registration-category';
import { registrationZoneList } from '../models/registration-zone';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { CreatePopupComponent } from '../../../../../shared/modal/create-popup/create-popup.component';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { CheckListPopupComponent } from '../../../../../shared/modal/check-list-popup/check-list-popup.component';
import { PreHireChecklistComponent } from '../pre-hire-checklist/pre-hire-checklist.component';
import { fileUpload } from '../models/file-upload';
import { ConfirmDeleteComponent } from '../../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TruckModel } from '../models/truck.model';
import { TruckDocumentType } from '../../../../../shared/Enums/registration_type';

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
    DatePipe,
    ReactiveFormsModule,
    CreatePopupComponent,
    FileUploadPopupComponent,
    ImageGalleryComponent,
    CheckListPopupComponent,
    PreHireChecklistComponent,
    MatFormField,
    MatInput,
  ],
  templateUrl: './truck-details.component.html',
  styleUrl: './truck-details.component.scss',
})
export class TruckDetailsComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  inEditMode = false;
  registrationTypePlaceholder: string;
  registrationOpenedType: boolean;
  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened: boolean;
  registrationZonePlaceholder: string;
  singleTruck: TruckModel;
  documents: any[] = [];
  truckAddForm: FormGroup;
  isConfirmModalOpen: boolean;
  closedDocument: any[] = [];

  constructor(private shared: DriverEditSharedService) {}

  onSelectRegistrationype($event: number) {
    this.registrationTypePlaceholder = this.registrationListType.find(
      x => x.id === $event
    ).value;
    this.registrationListType.forEach(x => (x.selected = x.id === $event));
    this.registrationOpenedType = false;
    this.truckAddForm.patchValue({
      registration_category: this.registrationTypePlaceholder,
    });
  }

  onClickRegistrationType($event: boolean) {
    this.registrationOpenedType = $event;
  }

  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }

  onSelectRegistrationZone($event: number) {
    this.registrationZonePlaceholder = this.registrationZoneList.find(
      x => x.id === $event
    ).value;
    this.registrationZoneList.forEach(x => (x.selected = x.id === $event));
    this.registrationZoneOpened = false;
    this.truckAddForm.patchValue({
      registration_zone: this.registrationZonePlaceholder,
    });
  }

  getFullRegistrationName() {
    return `${this.singleTruck.registrationZone} ${this.singleTruck.registrationCategory} ${this.singleTruck.registrationSerial} ${this.singleTruck.registrationNum}`;
  }

  ngOnInit(): void {
    localStorage.removeItem('previousDocument');
    this.shared.isUploadPopupOpen.subscribe(value => {
      this.isUploadPopupOpen = value;
    });
    this.singleTruck = JSON.parse(localStorage.getItem('truck'));
    this.truckAddForm = this.shared.truckUpdateForm;
    this.registrationTypePlaceholder = this.singleTruck?.registrationCategory;
    this.registrationZonePlaceholder = this.singleTruck?.registrationZone;
    this.truckAddForm
      .get('registration_serial')
      .valueChanges.subscribe(value => {
        this.numberOnly(value);
      });
    this.shared.bindTruckValueWithForm(this.singleTruck);
    this.truckAddForm.get('registration_num').valueChanges.subscribe(value => {
      this.numberOnly(value);
    });
    this.documents = this.shared.getTruckDocument(this.singleTruck);
    localStorage.setItem('previousDocument', JSON.stringify(this.documents));
    this.truckFileTypeModify(this.documents);
  }

  onClickSave() {
    this.shared.onTruckUpdate();
  }

  onAddFile($event: any) {
    this.shared.onChangeTruckFile($event);
    this.documents = this.shared.truckDocuments;
  }

  onClickEdit() {
    this.inEditMode = true;
    this.shared.closeInputSelect.next(false);
  }

  private numberOnly(value: any) {
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      this.truckAddForm.patchValue({
        registration_serial: value?.replace(/[^0-9]/g, ''),
        registration_num: value?.replace(/[^0-9]/g, ''),
      });
    }
  }

  protected readonly Date = Date;
  protected readonly truckFileType = fileUpload;
  isUploadPopupOpen: boolean;
  prehireCheckListOpened: boolean = false;
  newTruckFileTypeOptions: CustomInputSelectModel[];
  fileName: string;

  onClickClose(document: any) {
    this.isConfirmModalOpen = true;
    this.closedDocument = document;
    this.fileName = document.name;
    this.dialog
      .open(ConfirmDeleteComponent, {
        width: '21.875rem',
        data: {
          title: 'Delete Document',
          text: `Are you sure you want to delete this document ${this.fileName}?`,
        },
      })
      .afterClosed()
      .subscribe(res => {
        if (res === 'deleted') {
          this.performRemove(res);
        }
      });
  }

  private truckFileTypeModify(documents: any[]) {
    this.newTruckFileTypeOptions = JSON.parse(
      JSON.stringify(this.truckFileType)
    );
    documents.forEach(document => {
      this.newTruckFileTypeOptions = this.newTruckFileTypeOptions.filter(
        item => item.value !== document.name
      );
    });
  }

  performRemove($event: any) {
    this.isConfirmModalOpen = false;
    this.shared.onClickTruckCloseButton(this.closedDocument);
    this.documents = this.shared.truckDocuments;
    this.truckFileTypeModify(this.documents);
  }

  onClickCancel() {
    this.inEditMode = false;
    this.documents = [];
    this.documents = JSON.parse(localStorage.getItem('previousDocument'));
    localStorage.removeItem('previousDocument');
  }

  onCLickUpload() {
    // filter newDriverFileType to remove the documents that are already uploaded
    // shalow copy of the driverFileType
    this.truckFileTypeModify(this.documents);
    this.dialog
      .open(FileUploadPopupComponent, {
        width: '40%',
        data: {
          filetype: this.newTruckFileTypeOptions,
          isFromDriver: true,
          value: this.singleTruck,
        },
      })
      .afterClosed()
      .subscribe(res => {
        if (res != 'close') {
          this.onAddFile(res);
          this.documents = this.shared.truckDocuments;
        }
      });
  }

  onClickPrehireCheckList() {
    this.dialog.open(PreHireChecklistComponent, {
      width: '40%',
    });
  }

  getDocumentName(documentType: string) {
    if (
      documentType ==
      TruckDocumentType[TruckDocumentType.FITNESS_CERTIFICATE_FILE]
    ) {
      return 'Fitness';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.REG_PAPER_FILE]
    ) {
      return 'Registration Paper';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.ROUTE_PERMIT_FILE]
    ) {
      return 'Route Permit';
    } else if (documentType == TruckDocumentType[TruckDocumentType.TAX_FILE]) {
      return 'Tax';
    } else if (documentType == TruckDocumentType[TruckDocumentType.CASE_FILE]) {
      return 'Case';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.OTHER_FILE]
    ) {
      return 'Other';
    } else {
      return 'Other';
    }
  }
}
