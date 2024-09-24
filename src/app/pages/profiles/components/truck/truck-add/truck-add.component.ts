import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { registrationZoneList } from '../models/registration-zone';
import { registrationCategoryList } from '../models/registration-category';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TruckService } from '../services/truck.service';
import { PreHireChecklistComponent } from '../pre-hire-checklist/pre-hire-checklist.component';
import { CreatePopupComponent } from '../../../../../shared/modal/create-popup/create-popup.component';
import { Router } from '@angular/router';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { fileUpload } from '../models/file-upload';
import { CheckListPopupComponent } from '../../../../../shared/modal/check-list-popup/check-list-popup.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TruckFileType, truckFileType } from '../models/truck-file-type';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';

@Component({
  selector: 'app-truck-add',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    NgIf,
    UploadButtonComponent,
    NgClass,
    FileUploadPopupComponent,
    ReactiveFormsModule,
    PreHireChecklistComponent,
    CreatePopupComponent,
    CheckListPopupComponent,
    FileUploadComponent,
    MatFormField,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    NgForOf,
    MatMenu,
    MatMenuTrigger,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './truck-add.component.html',
  styleUrl: './truck-add.component.scss',
})
export class TruckAddComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  readonly dialog = inject(MatDialog);
  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened: boolean;
  registrationZonePlaceholder: string;
  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationOpenedType: boolean;
  registrationTypePlaceholder: string;
  truckAddForm: FormGroup;
  singleChecklist: any = {};
  prehireCheckListOpened: boolean = false;
  registrationErrorMessage = '';
  registrationCategoryErrorMessage = '';
  registrationSerialErrorMessage = '';
  registrationNumErrorMessage = '';
  countPassCheckList: number = 0;
  preHireCheckList: any;
  registrationInput: string;
  everyThingDisabled: boolean = true;
  loading: boolean = false;
  truckImages: any[] = [];
  insuranceImages: any[] = [];
  casePaperImages: any[] = [];
  regPaperImages: any[] = [];
  taxImages: any[] = [];
  fitnessImages: any[] = [];
  routePermitImages: any[] = [];
  othersImages: any[] = [];
  selectedFormControlName: any = '';
  maxUploadAble: number = 0;

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private toastr: HandleToastrService,
    private router: Router,
    private validation: ValidationService,
    private datePipe: DatePipe,
    private imageGalleryService: ImageGalleryService
  ) {
    this.truckAddForm = this.fb.group({
      registration_zone: [null, Validators.required],
      registration_category: [null, Validators.required],
      registration_serial: [
        null,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(2),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      registration_num: [
        null,
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
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

  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }

  onSelectRegistrationZone($event: number) {
    this.registrationErrorMessage = '';
    this.registrationZonePlaceholder = this.registrationZoneList.find(
      option => option.id === $event
    ).value;
    this.registrationZoneList.forEach(option => {
      option.selected = option.id === $event;
    });
    this.registrationZoneOpened = false;
    this.truckAddForm.patchValue({
      registration_zone: this.registrationZonePlaceholder,
    });
  }

  onClickRegistrationType($event: boolean) {
    this.registrationOpenedType = $event;
  }

  onSelectRegistrationType($event: number) {
    this.registrationCategoryErrorMessage = '';
    this.registrationTypePlaceholder = this.registrationListType.find(
      option => option.id === $event
    ).showname;
    this.registrationInput = this.registrationListType.find(
      option => option.id === $event
    ).value;
    this.registrationListType.forEach(option => {
      option.selected = option.id === $event;
    });
    this.registrationOpenedType = false;
    this.truckAddForm.patchValue({
      registration_category: this.registrationInput,
    });
  }

  ngOnInit(): void {
    this.loading = false;
    this.getPrehireChecklist();
    this.truckAddForm
      .get('registration_serial')
      .valueChanges.subscribe(value => {
        this.numberOnly(value);
        this.registrationSerialErrorMessage =
          this.validation.getRegistrationSerialValidation(
            this.truckAddForm.get('registration_serial')
          );
      });
    this.truckAddForm.get('registration_num').valueChanges.subscribe(value => {
      this.numberOnly(value);
      this.registrationNumErrorMessage =
        this.validation.getRegistrationNoValidation(
          this.truckAddForm.get('registration_num')
        );
    });
    // only listen to registration zone, registration category, registration serial and registration number
    this.truckAddForm.get('registration_zone')?.valueChanges.subscribe(() => {
      if (
        this.truckAddForm.get('registration_num')?.valid &&
        this.truckAddForm.get('registration_serial')?.valid &&
        this.truckAddForm.get('registration_category')?.valid &&
        this.truckAddForm.get('registration_zone')?.valid
      ) {
        this.validateTruckInformation();
      } else {
        this.everyThingDisabled = true;
      }
    });
    this.truckAddForm
      .get('registration_category')
      ?.valueChanges.subscribe(() => {
        if (
          this.truckAddForm.get('registration_num')?.valid &&
          this.truckAddForm.get('registration_serial')?.valid &&
          this.truckAddForm.get('registration_category')?.valid &&
          this.truckAddForm.get('registration_zone')?.valid
        ) {
          this.validateTruckInformation();
        } else {
          this.everyThingDisabled = true;
        }
      });
    this.truckAddForm.get('registration_serial')?.valueChanges.subscribe(() => {
      if (
        this.truckAddForm.get('registration_num')?.valid &&
        this.truckAddForm.get('registration_serial')?.valid &&
        this.truckAddForm.get('registration_category')?.valid &&
        this.truckAddForm.get('registration_zone')?.valid
      ) {
        this.validateTruckInformation();
      } else {
        this.everyThingDisabled = true;
      }
    });
    this.truckAddForm.get('registration_num')?.valueChanges.subscribe(() => {
      if (
        this.truckAddForm.get('registration_num')?.valid &&
        this.truckAddForm.get('registration_serial')?.valid &&
        this.truckAddForm.get('registration_category')?.valid &&
        this.truckAddForm.get('registration_zone')?.valid
      ) {
        this.validateTruckInformation();
      } else {
        this.everyThingDisabled = true;
      }
    });
  }

  onClickSave() {
    this.loading = true;
    if (this.truckAddForm.valid) {
      if (this.truckAddForm.get('checklist')?.value === null) {
        this.truckAddForm.patchValue({
          checklist: this.singleChecklist,
        });
      }
      const formData = new FormData();
      const payload: Record<string, any> = {};

      // Iterate over form controls
      Object.keys(this.truckAddForm.controls).forEach(key => {
        const control = this.truckAddForm.get(key);
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

      this.service.addTruck(formData).subscribe(
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
      this.truckAddForm.markAllAsTouched();
      this.loading = false;
      this.registrationErrorMessage = this.validation.getDropdownValidation(
        this.truckAddForm.get('registration_zone')
      );
      this.registrationCategoryErrorMessage =
        this.validation.getDropdownValidation(
          this.truckAddForm.get('registration_category')
        );
      this.registrationSerialErrorMessage =
        this.validation.getRegistrationSerialValidation(
          this.truckAddForm.get('registration_serial')
        );
      this.registrationNumErrorMessage =
        this.validation.getRegistrationNoValidation(
          this.truckAddForm.get('registration_num')
        );
    }
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

  onClickPrehiredChecklist($event: any) {
    this.countPassCheckList = 0;
    this.prehireCheckListOpened = !$event;
    this.singleChecklist = $event;
    this.truckAddForm.patchValue({
      checklist: $event,
    });
    for (const key in $event) {
      if ($event[key] === 'PASS') {
        this.countPassCheckList += 1;
      }
    }
  }

  protected readonly fileUpload = fileUpload;

  private getPrehireChecklist() {
    this.service.getPreHireChecklist().subscribe((res: any) => {
      this.preHireCheckList = res.data;
      this.preHireCheckList.forEach((item: any) => {
        this.singleChecklist[item.id] = '';
      });
    });
  }

  private validateTruckInformation() {
    const body = {
      registeredZone: this.truckAddForm.get('registration_zone').value,
      registrationCategory: this.truckAddForm.get('registration_category')
        .value,
      registrationSerialNumber: this.truckAddForm.get('registration_serial')
        .value,
      registrationNumber: this.truckAddForm.get('registration_num').value,
    };
    this.service.validateTruckInformation(body).subscribe({
      next: (res: any) => {
        if (res.data == false) {
          this.registrationErrorMessage = '';
          this.registrationCategoryErrorMessage = '';
          this.registrationSerialErrorMessage = '';
          this.registrationNumErrorMessage = '';
          this.everyThingDisabled = false;
        } else {
          this.everyThingDisabled = true;
          this.registrationErrorMessage = 'This vehicle is already registered';
          this.registrationCategoryErrorMessage =
            'This vehicle is already registered';
          this.registrationSerialErrorMessage =
            'This vehicle is already registered';
          this.registrationNumErrorMessage =
            'This vehicle is already registered';
        }
      },
    });
  }

  onDateChange($event: Event, expiryFormControlName: string) {
    let date = ($event.target as HTMLInputElement).value;
    date = this.datePipe.transform(date, 'yyyy-MM-ddThh:mm:ss');
    this.truckAddForm.patchValue({
      [expiryFormControlName]: date,
    });
  }

  protected readonly truckFileType: TruckFileType[] = truckFileType;
  viewMoreFormControlName: string | undefined;

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (this.truckAddForm.get(this.selectedFormControlName)?.value) {
      const currentFiles = Array.from(
        this.truckAddForm.get(this.selectedFormControlName)?.value
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

  triggerFileUpload(formControlName: string, max: number) {
    this.selectedFormControlName = formControlName;
    this.maxUploadAble = max;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  private onAddFile(files: FileList) {
    this.truckAddForm.patchValue({
      [this.selectedFormControlName]: files,
    });
    switch (this.selectedFormControlName) {
      case 'truckImages':
        this.previewFile(files, this.truckImages);
        break;
      case 'insuranceFiles':
        this.previewFile(files, this.insuranceImages);
        if (this.insuranceImages.length > 0) {
          this.truckAddForm
            .get('insuranceExpDate')
            ?.setValidators([Validators.required]);
          this.truckAddForm.get('insuranceExpDate')?.updateValueAndValidity();
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
          this.truckAddForm
            .get('fitnessCertExpDate')
            ?.setValidators([Validators.required]);
          this.truckAddForm.get('fitnessCertExpDate')?.updateValueAndValidity();
        }
        break;
      case 'routePermitFile':
        this.previewFile(files, this.routePermitImages, 'routePermitExpDate');
        if (this.routePermitImages.length > 0) {
          this.truckAddForm
            .get('caseExpDate')
            ?.setValidators([Validators.required]);
          this.truckAddForm.get('caseExpDate')?.updateValueAndValidity();
        }
        break;
      case 'casePaperFile':
        this.previewFile(files, this.casePaperImages, 'caseExpDate');
        if (this.casePaperImages.length > 0) {
          this.truckAddForm.get('others')?.setValidators([Validators.required]);
          this.truckAddForm.get('others')?.updateValueAndValidity();
        }
        break;
      case 'others':
        this.previewFile(files, this.othersImages);
        break;
    }
  }

  getSpecificFiles(formControlName: string | undefined) {
    switch (formControlName) {
      case 'truckImages':
        if (this.truckImages.length > 3) {
          return this.truckImages.slice(0, 3);
        } else {
          return this.truckImages;
        }
      case 'insuranceFiles':
        if (this.insuranceImages.length > 3) {
          return this.insuranceImages.slice(0, 3);
        } else {
          return this.insuranceImages;
        }
      case 'regPaperFile':
        if (this.regPaperImages.length > 3) {
          return this.regPaperImages.slice(0, 3);
        } else {
          return this.regPaperImages;
        }
      case 'taxFile':
        if (this.taxImages.length > 3) {
          return this.taxImages.slice(0, 3);
        } else {
          return this.taxImages;
        }
      case 'fitnessCertificateFile':
        if (this.fitnessImages.length > 3) {
          return this.fitnessImages.slice(0, 3);
        } else {
          return this.fitnessImages;
        }
      case 'routePermitFile':
        if (this.routePermitImages.length > 3) {
          return this.routePermitImages.slice(0, 3);
        } else {
          return this.routePermitImages;
        }
      case 'casePaperFile':
        if (this.casePaperImages.length > 3) {
          return this.casePaperImages.slice(0, 3);
        } else {
          return this.casePaperImages;
        }
      case 'others':
        if (this.othersImages.length > 3) {
          return this.othersImages.slice(0, 3);
        } else {
          return this.othersImages;
        }
      default:
        return [];
    }
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
      this.truckAddForm
        .get(expiredControl)
        ?.setValidators([Validators.required]);
      this.truckAddForm.get(expiredControl)?.updateValueAndValidity();
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
    this.truckAddForm.patchValue({
      [formControlName]: formControlFiles,
    });
  }

  onClickViewMore(truckImagePop: any) {
    this.dialog.open(truckImagePop, {});
  }

  onClickClosePopUp(truckImagePop: MatMenu) {
    this.matMenuTrigger.closeMenu();
  }

  onClickImage(preview: any) {
    this.imageGalleryService.setCurrentImage(preview);
    this.dialog.open(ImageGalleryComponent, {});
  }

  getFileArray(formControlName: string | undefined) {
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

  getTruckImageTitle(menuData: any) {
    if (menuData) {
      switch (menuData) {
        case 'truckImages':
          return 'Truck Images';
        case 'insuranceFiles':
          return 'Insurance Files';
        case 'regPaperFile':
          return 'Registration Paper Files';
        case 'taxFile':
          return 'Tax Files';
        case 'fitnessCertificateFile':
          return 'Fitness Certificate Files';
        case 'routePermitFile':
          return 'Route Permit Files';
        case 'casePaperFile':
          return 'Case Paper Files';
        case 'others':
          return 'Others Files';
        default:
          return '';
      }
    } else {
      return '';
    }
  }
}
