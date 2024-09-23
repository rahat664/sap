import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { registrationCategoryList } from '../models/registration-category';
import { registrationZoneList } from '../models/registration-zone';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { CreatePopupComponent } from '../../../../../shared/modal/create-popup/create-popup.component';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { CheckListPopupComponent } from '../../../../../shared/modal/check-list-popup/check-list-popup.component';
import { PreHireChecklistComponent } from '../pre-hire-checklist/pre-hire-checklist.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TruckDocument, TruckModel } from '../models/truck.model';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { truckFileType } from '../models/truck-file-type';
import { ActivatedRoute, Router } from '@angular/router';
import { TruckService } from '../services/truck.service';
import { PreHireChecklistDetailsComponent } from '../pre-hire-checklist-details/pre-hire-checklist-details.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TruckDocumentType } from '../../../../../shared/Enums/registration_type';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { ConfirmApproveComponent } from '../../../../../shared/modules/confirm-approve/confirm-approve.component';
import { ConfirmRejectComponent } from '../../../../../shared/modules/confirm-reject/confirm-reject.component';

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
    MatSuffix,
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
  savedRegistrationPaper: TruckDocument[] = [];
  savedTaxPaper: TruckDocument[] = [];
  savedFitnessCertificate: TruckDocument[] = [];
  savedRoutePermit: TruckDocument[] = [];
  savedCasePaper: TruckDocument[] = [];
  savedOthers: TruckDocument[] = [];
  savedTruckImages: TruckDocument[] = [];
  savedInsurancePaper: TruckDocument[] = [];
  selectedFormControlName: string;
  maxUploadAble: number;
  truckImages: any[] = [];
  insuranceImages: any[] = [];
  casePaperImages: any[] = [];
  regPaperImages: any[] = [];
  taxImages: any[] = [];
  fitnessImages: any[] = [];
  routePermitImages: any[] = [];
  othersImages: any[] = [];
  countPassCheckList: number;
  singleChecklist: any;

  constructor(
    private shared: DriverEditSharedService,
    private route: ActivatedRoute,
    private service: TruckService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: HandleToastrService,
    private router: Router,
    private validation: ValidationService
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
    this.truckUpdateForm.get('id').setValue(this.truckDetails.id);
    this.loading = true;
    if (this.truckUpdateForm.valid) {
      if (this.truckUpdateForm.get('checklist')?.value === null) {
        this.truckUpdateForm.patchValue({
          checklist: this.singleChecklist,
        });
      }
      const formData = new FormData();
      const payload: Record<string, any> = {};

      // Iterate over form controls
      Object.keys(this.truckUpdateForm.controls).forEach(key => {
        const control = this.truckUpdateForm.get(key);
        const value = control.value;

        if (
          key.endsWith('File') ||
          key === 'others' ||
          key === 'truckImages' ||
          key === 'insuranceFiles'
        ) {
          // Append multiple files to the FormData
          if (value) {
            Array.from(value).forEach((file: any) => {
              formData.append(key, file);
            });
          }
          // Append file controls directly to the FormData
        } else {
          // Add other controls to the payload object
          payload[key] = value;
        }
      });
      formData.append('payload', JSON.stringify(payload));

      this.service.editTruck(formData).subscribe(
        (res: any) => {
          this.loading = false;
          // Handle response
          if (res.status == 'OK') {
            this.toastr.showSuccess(res.message);
            this.router.navigate(['/profile/truck']);
          } else {
            this.toastr.showError(res.message);
          }
        },
        error => {
          // Handle error
          this.toastr.showError(error.error.message);
        }
      );
    } else {
      this.truckUpdateForm.markAllAsTouched();
      this.loading = false;
      this.registrationErrorMessage = this.validation.getDropdownValidation(
        this.truckUpdateForm.get('registration_zone')
      );
      this.registrationCategoryErrorMessage =
        this.validation.getDropdownValidation(
          this.truckUpdateForm.get('registration_category')
        );
      this.registrationSerialErrorMessage =
        this.validation.getRegistrationSerialValidation(
          this.truckUpdateForm.get('registration_serial')
        );
      this.registrationNumErrorMessage =
        this.validation.getRegistrationNoValidation(
          this.truckUpdateForm.get('registration_num')
        );
    }
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
  registrationNumErrorMessage: string;
  registrationSerialErrorMessage: string;
  registrationCategoryErrorMessage: string;
  registrationErrorMessage: string;
  isInEditMode: boolean;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  triggerFileUpload(formControlName: string, max: number) {
    this.selectedFormControlName = formControlName;
    this.maxUploadAble = max - this.getSpecificFiles(formControlName)?.length;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  getSpecificFiles(formControlName: string | undefined, length?: number) {
    switch (formControlName) {
      case 'truckImages':
        if (this.truckImages.length > length) {
          return this.truckImages.slice(0, length);
        } else {
          return this.truckImages;
        }
      case 'insuranceFiles':
        if (this.insuranceImages.length > length) {
          return this.insuranceImages.slice(0, length);
        } else {
          return this.insuranceImages;
        }
      case 'regPaperFile':
        if (this.regPaperImages.length > length) {
          return this.regPaperImages.slice(0, length);
        } else {
          return this.regPaperImages;
        }
      case 'taxFile':
        if (this.taxImages.length > length) {
          return this.taxImages.slice(0, length);
        } else {
          return this.taxImages;
        }
      case 'fitnessCertificateFile':
        if (this.fitnessImages.length > length) {
          return this.fitnessImages.slice(0, length);
        } else {
          return this.fitnessImages;
        }
      case 'routePermitFile':
        if (this.routePermitImages.length > length) {
          return this.routePermitImages.slice(0, length);
        } else {
          return this.routePermitImages;
        }
      case 'casePaperFile':
        if (this.casePaperImages.length > length) {
          return this.casePaperImages.slice(0, length);
        } else {
          return this.casePaperImages;
        }
      case 'others':
        if (this.othersImages.length > length) {
          return this.othersImages.slice(0, length);
        } else {
          return this.othersImages;
        }
      default:
        return [];
    }
  }

  getFileArray(formControlName: any) {
    switch (formControlName) {
      case 'truckImages':
        return this.truckImages;
      case 'insuranceFiles':
        return this.insuranceImages;
      case 'regPaperFile':
        return this.regPaperImages;
      case 'taxFile':
        return this.taxImages;
      case 'fitnessCertificateFile':
        return this.fitnessImages;
      case 'routePermitFile':
        return this.routePermitImages;
      case 'casePaperFile':
        return this.casePaperImages;
      case 'others':
        return this.othersImages;
      default:
        return [];
    }
  }

  onCloseImage(formControlName: string | undefined, file: any) {
    let files: any[] = [];
    files = this.getSpecificFiles(formControlName);
    this.dialog.closeAll();
    const index = files.indexOf(file);
    files.splice(index, 1);
    const formControlFiles = [];
    files.forEach((file: any) => {
      formControlFiles.push(file.file);
    });
    this.truckUpdateForm.patchValue({
      [formControlName]: formControlFiles,
    });
  }

  onDateChange($event: Event, expiryFormControlName: string) {
    let date = ($event.target as HTMLInputElement).value;
    date = this.datePipe.transform(date, 'yyyy-MM-ddThh:mm:ss');
    this.truckUpdateForm.patchValue({
      [expiryFormControlName]: date,
    });
  }

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
    this.route.paramMap.subscribe(params => {
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

  onClickPreHiredChecklist($event: any) {
    this.countPassCheckList = 0;
    this.singleChecklist = $event;
    this.truckUpdateForm.patchValue({
      checklist: $event,
    });
    for (const key in $event) {
      if ($event[key] === 'PASS') {
        this.countPassCheckList += 1;
      }
    }
  }

  private initiateForm() {
    this.truckUpdateForm = this.fb.group({
      id: [null],
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

  private onAddFile(files: FileList) {
    this.truckUpdateForm.patchValue({
      [this.selectedFormControlName]: files,
    });
    switch (this.selectedFormControlName) {
      case 'truckImages':
        this.previewFile(files, this.truckImages);
        break;
      case 'insuranceFiles':
        this.previewFile(files, this.insuranceImages);
        if (this.insuranceImages.length > 0) {
          this.truckUpdateForm
            .get('insuranceExpDate')
            ?.setValidators([Validators.required]);
          this.truckUpdateForm
            .get('insuranceExpDate')
            ?.updateValueAndValidity();
        }
        break;
      case 'regPaperFile':
        this.previewFile(files, this.regPaperImages);
        break;
      case 'taxFile':
        this.previewFile(files, this.taxImages, 'taxExpDate');
        break;
      case 'fitnessCertificateFile':
        this.previewFile(files, this.fitnessImages, 'fitnessCertExpDate');
        if (this.fitnessImages.length > 0) {
          this.truckUpdateForm
            .get('fitnessCertExpDate')
            ?.setValidators([Validators.required]);
          this.truckUpdateForm
            .get('fitnessCertExpDate')
            ?.updateValueAndValidity();
        }
        break;
      case 'routePermitFile':
        this.previewFile(files, this.routePermitImages, 'routePermitExpDate');
        if (this.routePermitImages.length > 0) {
          this.truckUpdateForm
            .get('caseExpDate')
            ?.setValidators([Validators.required]);
          this.truckUpdateForm.get('caseExpDate')?.updateValueAndValidity();
        }
        break;
      case 'casePaperFile':
        this.previewFile(files, this.casePaperImages, 'caseExpDate');
        if (this.casePaperImages.length > 0) {
          this.truckUpdateForm
            .get('others')
            ?.setValidators([Validators.required]);
          this.truckUpdateForm.get('others')?.updateValueAndValidity();
        }
        break;
      case 'others':
        this.previewFile(files, this.othersImages);
        break;
    }
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (this.truckUpdateForm.get(this.selectedFormControlName)?.value) {
      const currentFiles = Array.from(
        this.truckUpdateForm.get(this.selectedFormControlName)?.value
      );
      if (currentFiles.length + files.length > this.maxUploadAble) {
        this.toastr.showError(
          `You can upload maximum of ${this.maxUploadAble} files`
        );
        return;
      } else {
        this.onAddFile(files);
      }
    } else {
      if (files.length > this.maxUploadAble) {
        this.toastr.showError(
          `You can upload maximum of ${this.maxUploadAble} files`
        );
        return;
      } else {
        this.onAddFile(files);
      }
    }
  }

  checkThatFileIsAvailableOrNot(name: string) {
    switch (name) {
      case 'Registration paper':
        const regFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.REG_PAPER_FILE]
        );
        this.savedRegistrationPaper = regFile?.length > 0 ? regFile : [];
        return regFile?.length > 0 ? regFile.slice(0, 3) : [];
      case 'Tax paper':
        const taxFile = this.truckDetails?.truckDocumentList.filter(
          x => x.documentType === TruckDocumentType[TruckDocumentType.TAX_FILE]
        );
        this.savedTaxPaper = taxFile?.length > 0 ? taxFile : [];
        return taxFile?.length > 0 ? taxFile.slice(0, 3) : [];
      case 'Fitness certificate':
        const fitFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.FITNESS_CERTIFICATE_FILE]
        );
        this.savedFitnessCertificate = fitFile?.length > 0 ? fitFile : [];
        return fitFile?.length > 0 ? fitFile.slice(0, 3) : [];
      case 'Route permit':
        const routeFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.ROUTE_PERMIT_FILE]
        );
        this.savedRoutePermit = routeFile?.length > 0 ? routeFile : [];
        return routeFile?.length > 0 ? routeFile.slice(0, 3) : [];
      case 'Case paper':
        const caseFile = this.truckDetails?.truckDocumentList.filter(
          x => x.documentType === TruckDocumentType[TruckDocumentType.CASE_FILE]
        );
        this.savedCasePaper = caseFile?.length > 0 ? caseFile : [];
        return caseFile?.length > 0 ? caseFile.slice(0, 3) : [];
      case 'Others document':
        const otherFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType === TruckDocumentType[TruckDocumentType.OTHER_FILE]
        );
        this.savedOthers = otherFile?.length > 0 ? otherFile : [];
        return otherFile?.length > 0 ? otherFile.slice(0, 3) : [];
      case 'Truck images':
        const truckImageFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType === TruckDocumentType[TruckDocumentType.TRUCK_IMAGE]
        );
        this.savedTruckImages =
          truckImageFile?.length > 0 ? truckImageFile : [];
        return truckImageFile?.length > 0 ? truckImageFile.slice(0, 3) : [];
      case 'Insurance paper':
        const insuranceFile = this.truckDetails?.truckDocumentList.filter(
          x =>
            x.documentType ===
            TruckDocumentType[TruckDocumentType.INSURANCE_FILE]
        );
        this.savedInsurancePaper =
          insuranceFile?.length > 0 ? insuranceFile : [];
        return insuranceFile?.length > 0 ? insuranceFile.slice(0, 3) : [];
      default:
        return [];
    }
  }

  getSavedFileArray(formControlName: string | undefined) {
    switch (formControlName) {
      case 'regPaperFile':
        return this.savedRegistrationPaper;
      case 'taxFile':
        return this.savedTaxPaper;
      case 'fitnessCertificateFile':
        return this.savedFitnessCertificate;
      case 'routePermitFile':
        return this.savedRoutePermit;
      case 'casePaperFile':
        return this.savedCasePaper;
      case 'others':
        return this.savedOthers;
      case 'truckImages':
        return this.savedTruckImages;
      case 'insuranceFiles':
        return this.savedInsurancePaper;
      default:
        return [];
    }
  }

  onCloseSaveImage(formControlName: string, file: TruckDocument) {}

  onClickReject() {
    this.dialog
      .open(ConfirmRejectComponent, {
        data: {
          title: 'Attention',
          text: `Do you want to reject ${this.truckDetails.fullRegistrationNumber}?`,
          buttonText: 'Reject',
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res.status === 'rejected') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['id'] = this.truckDetails.id;
          payload['status'] = 'Rejected';
          payload['rejectedReason'] = res.reason;
          formData.append('payload', JSON.stringify(payload));
          this.service.editTruck(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
                this.toastr.showSuccess(res.message);
                this.router.navigate(['/profile/truck']);
              } else {
                this.toastr.showError(res.message);
              }
            },
            error => {
              // Handle error
              this.toastr.showError(error.error.message);
            }
          );
        }
      });
  }

  onClickApprove() {
    this.dialog
      .open(ConfirmApproveComponent, {
        data: {
          title: 'Approve',
          text: `Do you want to approve ${this.truckDetails.fullRegistrationNumber}"?`,
          buttonText: 'Approve',
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res === 'updated') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['id'] = this.truckDetails.id;
          payload['status'] = 'Approved';
          formData.append('payload', JSON.stringify(payload));
          this.service.editTruck(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
                this.toastr.showSuccess(res.message);
                this.router.navigate(['/profile/truck']);
              } else {
                this.toastr.showError(res.message);
              }
            },
            error => {
              // Handle error
              this.toastr.showError(error.error.message);
            }
          );
        }
      });
  }

  private previewFile(
    files: FileList,
    targetArray: any[],
    expiredControl?: any
  ) {
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        targetArray.push({
          preview: reader.result,
          file: file,
        });
      };
    });
    if (expiredControl) {
      this.truckUpdateForm
        .get(expiredControl)
        ?.setValidators([Validators.required]);
      this.truckUpdateForm.get(expiredControl)?.updateValueAndValidity();
    }
  }

  checkDateIsExpiredOrNot(expiryDates: any) {
    const currentDate = new Date();
    const expiryDate = new Date(expiryDates);
    const isPastDate = expiryDate < currentDate;
    // count how many day, month, year left
    const diffTime = Math.abs(expiryDate.getTime() - currentDate.getTime());
    // split the difftime into years, months, days like if 30 days then 1 month and 0 days
    const diffDays = Math.floor((diffTime / (1000 * 60 * 60 * 24)) % 30);
    const diffMonths = Math.ceil((diffTime / (1000 * 60 * 60 * 24 * 30)) % 12);
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30 * 12));

    let text: string = '';
    if (isPastDate) {
      if (diffDays > 0 && diffMonths === 0 && diffYears === 0) {
        text = `Expired ${diffDays} ${diffDays > 1 ? 'days' : 'day'} ago`;
      } else if (diffMonths > 0 && diffYears === 0 && diffDays === 0) {
        text = `Expired ${diffMonths} ${diffMonths > 1 ? 'months' : 'month'} ago`;
      } else if (diffDays > 0 && diffMonths > 0 && diffYears === 0) {
        text = `Expired ${diffMonths} ${diffMonths > 1 ? 'months' : 'month'}, ${diffDays} ${diffDays > 1 ? 'days' : 'day'} ago`;
      } else if (diffDays > 0 && diffMonths > 0 && diffYears > 0) {
        text = `Expired ${diffYears} ${diffYears > 1 ? 'years' : 'year'}, ${diffMonths} ${diffMonths > 1 ? 'months' : 'month'}, ${diffDays} ${diffDays > 1 ? 'days' : 'day'} ago`;
      } else if (diffYears > 0 && diffMonths > 0 && diffDays === 0) {
        text = `Expired ${diffYears} ${diffYears > 1 ? 'years' : 'year'}, ${diffMonths} ${diffMonths > 1 ? 'months' : 'month'} ago`;
      } else if (diffYears > 0 && diffMonths === 0 && diffDays > 0) {
        text = `Expired ${diffYears} ${diffYears > 1 ? 'years' : 'year'}, ${diffDays} ${diffDays > 1 ? 'days' : 'day'} ago`;
      } else {
        text = `Expired ${diffYears} ${diffYears > 1 ? 'years' : 'year'} ago`;
      }
    } else {
      text = `Expiry Date: ${this.datePipe.transform(expiryDates, 'dd MMM yyyy')}`;
    }
    return {
      isExpired: isPastDate,
      text: text,
    };
  }
}
