import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { registrationCategoryList } from '../models/registration-category';
import { registrationZoneList } from '../models/registration-zone';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { CreatePopupComponent } from '../../../../../shared/modal/create-popup/create-popup.component';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { CheckListPopupComponent } from '../../../../../shared/modal/check-list-popup/check-list-popup.component';
import { PreHireChecklistComponent } from '../pre-hire-checklist/pre-hire-checklist.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TruckDocument, TruckModel } from '../models/truck.model';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { truckFileType } from '../models/truck-file-type';
import { ActivatedRoute } from '@angular/router';
import { TruckService } from '../services/truck.service';
import { PreHireChecklistDetailsComponent } from '../pre-hire-checklist-details/pre-hire-checklist-details.component';
import { provideNativeDateAdapter } from '@angular/material/core';
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
    MatDatepicker,
    MatMenu,
    MatMenuTrigger,
    MatDatepickerToggle,
    MatDatepickerInput,
    PreHireChecklistDetailsComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './truck-details.component.html',
  styleUrl: './truck-details.component.scss',
})
export class TruckDetailsComponent implements OnInit {
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  readonly dialog = inject(MatDialog);
  registrationTypePlaceholder: string = '';
  registrationOpenedType: boolean;
  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened: boolean;
  registrationZonePlaceholder: string = '';
  documents: TruckDocument[] = [];
  truckUpdateForm: FormGroup;
  protected loading: boolean;
  truckDetails: TruckModel;
  protected preHiredCheckList: any;
  savedRegistrationPaper: TruckDocument[];
  savedTaxPaper: TruckDocument[];
  savedFitnessCertificate: TruckDocument[];
  savedRoutePermit: TruckDocument[];
  savedCasePaper: TruckDocument[];
  savedOthers: TruckDocument[];
  savedTruckImages: TruckDocument[];
  savedInsurancePaper: TruckDocument[];

  constructor(
    private shared: DriverEditSharedService,
    private router: ActivatedRoute,
    private service: TruckService,
    private fb: FormBuilder
  ) {}

  onSelectRegistrationType($event: number) {
    this.registrationTypePlaceholder = this.registrationListType.find(
      x => x.id === $event
    ).value;
    this.registrationListType.forEach(x => (x.selected = x.id === $event));
    this.registrationOpenedType = false;
    this.truckUpdateForm.patchValue({
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
    this.truckUpdateForm.patchValue({
      registration_zone: this.registrationZonePlaceholder,
    });
  }

  ngOnInit(): void {
    this.getTruckDetailsByTruckId();
    this.initiateForm();
  }

  onClickSave() {
    this.loading = true;
    this.shared.onTruckUpdate();
  }

  private numberOnly(value: any) {
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      this.truckUpdateForm.patchValue({
        registration_serial: value?.replace(/[^0-9]/g, ''),
        registration_num: value?.replace(/[^0-9]/g, ''),
      });
    }
  }

  protected readonly Date = Date;
  protected readonly truckFileType = truckFileType;
  viewMoreFormControlName: string;
  registrationNumErrorMessage: boolean;
  registrationSerialErrorMessage: string;
  registrationCategoryErrorMessage: string;
  registrationErrorMessage: string;
  isInEditMode: boolean;

  onFileSelected($event: Event) {}

  triggerFileUpload(formControlName: any, max: any) {}

  getSpecificFiles(formControlName: any) {
    return [];
  }

  getFileArray(formControlName: any) {
    return [];
  }

  onCloseImage(formControlName: any, file: any) {}

  onDateChange($event: Event, expiryFormControlName: string) {}

  onClickImage(preview: any) {
    this.dialog.open(ImageGalleryComponent, {
      data: {
        images: preview,
      },
    });
  }

  onClickClosePopUp() {
    this.matMenuTrigger.closeMenu();
  }

  getTruckImageTitle(viewMoreFormControlName: string) {
    switch (viewMoreFormControlName) {
      case 'regPaperFile':
        return 'Registration paper';
      case 'taxFile':
        return 'Tax paper';
      case 'fitnessCertificateFile':
        return 'Fitness certificate';
      case 'routePermitFile':
        return 'Route permit';
      case 'casePaperFile':
        return 'Case paper';
      case 'others':
        return 'Others document';
      case 'truckImages':
        return 'Truck images';
      case 'insuranceFiles':
        return 'Insurance paper';
      default:
        return '';
    }
  }

  private getTruckDetailsByTruckId() {
    let truckId: string;
    // get truck id from query params
    this.router.paramMap.subscribe(params => {
      truckId = params.get('id'); // Assuming the truck ID is part of the route parameters
      this.service.getTruckById(truckId).subscribe((res: any) => {
        const truck: TruckModel = res.data;
        this.truckDetails = truck;
        this.documents = truck.truckDocumentList;
        this.updateFormValues(truck);
      });
      this.service.getPreHireChecklist(truckId).subscribe((res: any) => {
        // Do something with the pre-hire checklist
        this.preHiredCheckList = res.data;
      });
    });
  }

  private updateFormValues(truck: TruckModel) {
    this.truckUpdateForm.patchValue({
      registration_zone: truck.registrationZone,
      registration_category: truck.registrationCategory,
      registration_serial: truck.registrationSerial,
      registration_num: truck.registrationNum,
      fitnessCertExpDate: truck.fitnessCertExpDate,
      routePermitExpDate: truck.routePermitExpDate,
      caseExpDate: truck.caseExpDate,
      taxExpDate: truck.taxExpDate,
      insuranceExpDate: truck.insuranceExpDate,
      regPaperFile: truck.regPaperFile,
      taxFile: truck.taxFile,
    });
    this.registrationZonePlaceholder = truck.registrationZone;
    this.registrationTypePlaceholder = truck.registrationCategory;
  }

  onClickPrehiredChecklist($event: any) {}

  private initiateForm() {
    this.truckUpdateForm = this.fb.group({
      registration_zone: [null],
      registration_category: [null],
      registration_serial: [null],
      registration_num: [null],
      fitnessCertExpDate: [null],
      routePermitExpDate: [null],
      caseExpDate: [null],
      taxExpDate: [null],
      regPaperFile: [null],
      taxFile: [null],
      fitnessCertificateFile: [null],
      routePermitFile: [null],
      casePaperFile: [null],
      others: [null],
      checklist: [null],
      insuranceFiles: [null],
      truckImages: [null],
      insuranceExpDate: [null],
    });
  }

  onClickEdit() {
    this.isInEditMode = true;
  }

  checkThatFileIsAvailableOrNot(name: string) {
    switch (name) {
      case 'Registration paper':
        const regFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.REG_PAPER_FILE]
        );
        this.savedRegistrationPaper = regFile?.length > 0 ? regFile : null;
        return regFile?.length > 0 ? regFile : null;
      case 'Tax paper':
        const taxFile = this.truckDetails?.truckDocumentList.filter(
          x => x.documentType === TruckDocumentType[TruckDocumentType.TAX_FILE]
        );
        return taxFile?.length > 0 ? taxFile.slice(0, 3) : null;
      case 'Fitness certificate':
        const fitFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.FITNESS_CERTIFICATE_FILE]
        );
        this.savedFitnessCertificate = fitFile?.length > 0 ? fitFile : null;
        return fitFile?.length > 0 ? fitFile.slice(0, 3) : null;
      case 'Route permit':
        const routeFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.ROUTE_PERMIT_FILE]
        );
        this.savedRoutePermit = routeFile?.length > 0 ? routeFile : null;
        return routeFile?.length > 0 ? routeFile.slice(0, 3) : null;
      case 'Case paper':
        const caseFile = this.truckDetails?.truckDocumentList.filter(
          x => x.documentType === TruckDocumentType[TruckDocumentType.CASE_FILE]
        );
        this.savedCasePaper = caseFile?.length > 0 ? caseFile : null;
        return caseFile?.length > 0 ? caseFile.slice(0, 3) : null;
      case 'Others document':
        const otherFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType === TruckDocumentType[TruckDocumentType.OTHER_FILE]
        );
        this.savedOthers = otherFile?.length > 0 ? otherFile : null;
        return otherFile?.length > 0 ? otherFile.slice(0, 3) : null;
      case 'Truck images':
        const truckImageFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType === TruckDocumentType[TruckDocumentType.TRUCK_IMAGE]
        );
        this.savedTruckImages =
          truckImageFile?.length > 0 ? truckImageFile : null;
        return truckImageFile?.length > 0 ? truckImageFile.slice(0, 3) : null;
      case 'Insurance paper':
        const insuranceFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.INSURANCE_FILE]
        );
        this.savedInsurancePaper =
          insuranceFile?.length > 0 ? insuranceFile : null;
        return insuranceFile?.length > 0 ? insuranceFile.slice(0, 3) : null;
      default:
        return null;
    }
  }

  getSavedFileArray(formControlName: string | undefined) {
    switch (formControlName) {
      case 'regPaperFile':
        return this.savedRegistrationPaper;
      case 'taxFile':
        return this.checkThatFileIsAvailableOrNot('Tax paper');
      case 'fitnessCertificateFile':
        return this.savedFitnessCertificate;
      case 'routePermitFile':
        return this.savedRoutePermit;
      case 'casePaperFile':
        return this.savedCasePaper;
      case 'others':
        return this.savedOthers;
      case 'truckImages':
        console.log(this.savedTruckImages);
        return this.savedTruckImages;
      case 'insuranceFiles':
        return this.savedInsurancePaper;
      default:
        return null;
    }
  }
}
