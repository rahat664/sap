import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { FileUploadPopupComponent } from '../../truck/file-upload-popup/file-upload-popup.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { AlphabetOnlyDirective } from '../../../../../shared/directive/alphabet-only.directive';
import { FileUploadComponent } from '../../truck/file-upload/file-upload.component';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { PreHireChecklistComponent } from '../../truck/pre-hire-checklist/pre-hire-checklist.component';
import {
  DriverFileType,
  driverFileTypeModel,
} from '../../truck/models/driver-file-type';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { MatDialog } from '@angular/material/dialog';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';

@Component({
  selector: 'app-driver-add',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    UploadButtonComponent,
    FileUploadPopupComponent,
    ReactiveFormsModule,
    FormsModule,
    AlphabetOnlyDirective,
    FileUploadComponent,
    MatFormField,
    MatInput,
    CustomInputComponent,
    GetClickEventDirective,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatMenu,
    MatSuffix,
    NgForOf,
    PreHireChecklistComponent,
    MatMenuTrigger,
    NgxMaterialIntlTelInputComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './driver-add.component.html',
  styleUrl: './driver-add.component.scss',
})
export class DriverAddComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  readonly dialog = inject(MatDialog);
  driverAddForm: FormGroup;
  driverPhoneErrorMessage: string;
  nidFrontImages: any[] = [];
  nidBackImages: any[] = [];
  drivingLicenseFrontImages: any[] = [];
  drivingLicenseBackImages: any[] = [];
  othersImages: any[] = [];
  selectedFormControlName: string = '';
  maxUploadAble: number = 0;

  constructor(
    private fb: FormBuilder,
    private validation: ValidationService,
    private router: Router,
    private service: UserService,
    private toastr: HandleToastrService,
    private shared: DriverEditSharedService
    private toastr: HandleToastrService,
    private datePipe: DatePipe,
    private imageGalleryService: ImageGalleryService
  ) {
    this.driverAddForm = this.fb.group({
      driverName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      driverPhone: ['', [Validators.required]],
      nidFront: [null],
      nidBack: [null],
      drivingLicenseFront: [null],
      drivingLicenseBack: [null],
      other: [null],
      drivingLicenseExpiryDate: [null],
    });
  }

  ngOnInit(): void {
    this.shared.validateInterNationalPhoneNumber();
    this.driverAddForm
      .get('driverName')
      .valueChanges.subscribe((value: string) => {
        if (this.driverAddForm.get('driverName').hasError('required')) {
          this.driverNameErrorMessage = 'You must enter a value';
        } else {
          this.driverNameErrorMessage = '';
        }
      });
    this.driverAddForm
      .get('driverPhone')
      .valueChanges.subscribe((value: string) => {
        this.numberOnlyValidation(value);
        this.driverPhoneErrorMessage =
          this.validation.getDriverNumberValidation(
            this.driverAddForm.get('driverPhone')
          );
      });
  }

  private onAddFile(files: FileList) {
    this.driverAddForm.patchValue({
      [this.selectedFormControlName]: files,
    });
    switch (this.selectedFormControlName) {
      case 'nidFront':
        this.previewFile(files, this.nidFrontImages);
        break;
      case 'nidBack':
        this.previewFile(files, this.nidBackImages);
        break;
      case 'drivingLicenseFront':
        this.previewFile(
          files,
          this.drivingLicenseFrontImages,
          'drivingLicenseExpiryDate'
        );
        if (this.drivingLicenseFrontImages.length > 0) {
          this.driverAddForm
            .get('drivingLicenseExpiryDate')
            ?.setValidators([Validators.required]);
          this.driverAddForm.get('insuranceExpDate')?.updateValueAndValidity();
        }
        break;
      case 'drivingLicenseBack':
        this.previewFile(
          files,
          this.drivingLicenseBackImages,
          'drivingLicenseExpiryDate'
        );
        if (this.drivingLicenseBackImages.length > 0) {
          this.driverAddForm
            .get('drivingLicenseExpiryDate')
            ?.setValidators([Validators.required]);
          this.driverAddForm.get('insuranceExpDate')?.updateValueAndValidity();
        }
        break;
      case 'other':
        this.previewFile(files, this.othersImages);
        break;
    }
  }

  private previewFile(
    files: FileList,
    targetArray: any[],
    expiredControl?: any
  ) {
    Array.from(files).forEach((file: File) => {
      console.log(file.type);
      // handle if file is a pdf
      if (file.type === 'application/pdf') {
        targetArray.push({
          preview: 'assets/svg/pdf.svg',
          file: file,
        });
        return;
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          targetArray.push({
            preview: reader.result,
            file: file,
          });
        };
      }
    });
    if (expiredControl) {
      this.driverAddForm
        .get(expiredControl)
        ?.setValidators([Validators.required]);
      this.driverAddForm.get(expiredControl)?.updateValueAndValidity();
    }
  }

  protected readonly driverFileType: DriverFileType[] = driverFileTypeModel;
  driverName: string;
  driverPhone: string;
  driverNameErrorMessage: string;
  loading: any;
  everyThingDisabled: boolean;
  viewMoreFormControlName: string | undefined;
  viewMoreExpiryControlName: string | undefined;

  onDriverSave() {
    if (this.driverAddForm.valid) {
      if (!this.driverAddForm.get('drivingLicenseExpiryDate')?.value) {
        this.driverAddForm.removeControl('drivingLicenseExpiryDate');
      }
      const formData = new FormData();
      const payload: Record<string, any> = {};

      // Iterate over form controls
      Object.keys(this.driverAddForm.controls).forEach(key => {
        const control = this.driverAddForm.get(key);
        const value = control.value;

        if (
          key != 'driverName' &&
          key != 'driverPhone' &&
          key != 'drivingLicenseExpiryDate' &&
          key != 'role'
        ) {
          if (value) {
            Array.from(value).forEach((file: any) => {
              formData.append(key, file);
            });
          }
          // Append file controls directly to the FormData
        } else {
          // Add other controls to the payload object
          if (key === 'driverPhone') {
            payload[key] = value.replace(/[\s-]/g, '');
          } else {
            payload[key] = value;
          }
        }
      });
      formData.append('payload', JSON.stringify(payload));

      this.service.addDriver(formData).subscribe(
        (res: any) => {
          // Handle response
          if (res.status == 'OK') {
            localStorage.removeItem('driver');
            this.toastr.showSuccess(res.message);
            this.router.navigate(['/profile/driver']);
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
      this.driverAddForm.markAllAsTouched();
      this.driverPhoneErrorMessage = this.validation.getDriverNumberValidation(
        this.driverAddForm.get('driverPhone')
      );
      if (this.driverAddForm.get('driverName').hasError('required')) {
        this.driverNameErrorMessage = 'You must enter a value';
      }
    }
  }

  private numberOnlyValidation(value: any) {
    if (isNaN(value)) {
      this.driverAddForm?.get('driverPhone').setValue('');
    }
    if (value?.substring(0, 1) != '0' && value?.substring(0, 1)) {
      this.driverAddForm?.get('driverPhone').setErrors({ invalidNumber: true });
    }
    if (value?.substring(1, 2) != '1' && value?.substring(1, 2)) {
      this.driverAddForm?.get('driverPhone').setErrors({ invalidNumber: true });
    }
    const onlyNumbers = value?.replace(/[^\d]/g, '');
    if (onlyNumbers?.length > 11) {
      this.driverAddForm
        ?.get('driverPhone')
        .setValue(onlyNumbers.substring(0, 11));
    }
  }

  getDriverPhoneErrorWithoutTouch() {
    if (this.driverAddForm?.get('driverPhone').hasError('invalidNumber')) {
      return 'Invalid driver number';
    } else {
      return '';
    }
  }

  getDriverPhoneErrorWithTouch() {
    if (this.driverAddForm?.get('driverPhone').hasError('required')) {
      return 'Driver number required';
    } else if (this.driverAddForm?.get('driverPhone').hasError('minlength')) {
      return 'Invalid driver number';
    } else if (this.driverAddForm?.get('driverPhone').hasError('maxlength')) {
      return 'Invalid driver number';
    } else if (
      this.driverAddForm?.get('driverPhone').hasError('invalidNumber')
    ) {
      return 'Invalid driver number';
    } else {
      return '';
    }
  }

  getDriverNameError() {
    if (this.driverAddForm?.get('driverName').hasError('required')) {
      return 'Driver name required';
    } else if (this.driverAddForm?.get('driverName').hasError('minlength')) {
      return 'Invalid driver name';
    } else if (this.driverAddForm?.get('driverName').hasError('maxlength')) {
      return 'Invalid driver name';
    } else {
      return '';
    }
  }

  protected readonly CountryISO = CountryISO;

  get phoneNumber() {
    return this.driverAddForm.get('driverPhone');
  }

  textLabels = {
    mainLabel: 'Mobile number',
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: 'Number is not valid',
    requiredError: 'This field is required',
  };

  getFileArray(formControlName: any) {
    switch (formControlName) {
      case 'nidFront':
        return this.nidFrontImages;
      case 'nidBack':
        return this.nidBackImages;
      case 'drivingLicenseFront':
        return this.drivingLicenseFrontImages;
      case 'drivingLicenseBack':
        return this.drivingLicenseBackImages;
      case 'other':
        return this.othersImages;
      default:
        return [];
    }
  }

  onDateChange($event: Event, expiryFormControlName: string) {
    let date = ($event.target as HTMLInputElement).value;
    date = this.datePipe.transform(date, 'yyyy-MM-ddThh:mm:ss');
    this.driverAddForm.patchValue({
      [expiryFormControlName]: date,
    });
  }

  getSpecificFiles(formControlName: string | undefined) {
    switch (formControlName) {
      case 'nidFront':
        if (this.nidFrontImages.length > 3) {
          return this.nidFrontImages.slice(0, 3);
        } else {
          return this.nidFrontImages;
        }
      case 'nidBack':
        if (this.nidBackImages.length > 3) {
          return this.nidBackImages.slice(0, 3);
        } else {
          return this.nidBackImages;
        }
      case 'drivingLicenseFront':
        if (this.drivingLicenseFrontImages.length > 3) {
          return this.drivingLicenseFrontImages.slice(0, 3);
        } else {
          return this.drivingLicenseFrontImages;
        }
      case 'drivingLicenseBack':
        if (this.drivingLicenseBackImages.length > 3) {
          return this.drivingLicenseBackImages.slice(0, 3);
        } else {
          return this.drivingLicenseBackImages;
        }
      case 'other':
        if (this.othersImages.length > 3) {
          return this.othersImages.slice(0, 3);
        } else {
          return this.othersImages;
        }
      default:
        return [];
    }
  }

  onCloseImage(
    formControlName: string | undefined,
    file: any,
    expiredControl: any
  ) {
    let files: any[] = [];
    switch (formControlName) {
      case 'nidFront':
        this.nidFrontImages = this.nidFrontImages.filter(
          item => item.preview !== file.preview
        );
        files = this.nidFrontImages;
        break;
      case 'nidBack':
        this.nidBackImages = this.nidBackImages.filter(
          item => item.preview !== file.preview
        );
        files = this.nidBackImages;
        break;
      case 'drivingLicenseFront':
        this.drivingLicenseFrontImages = this.drivingLicenseFrontImages.filter(
          item => item.preview !== file.preview
        );
        files = this.drivingLicenseFrontImages;
        break;
      case 'drivingLicenseBack':
        this.drivingLicenseBackImages = this.drivingLicenseBackImages.filter(
          item => item.preview !== file.preview
        );
        break;
      case 'other':
        this.othersImages = this.othersImages.filter(
          item => item.preview !== file.preview
        );
        break;
    }
    const formControlFiles = [];
    files.forEach((file: any) => {
      formControlFiles.push(file.file);
    });
    this.driverAddForm.patchValue({
      [formControlName]: formControlFiles,
    });

    if (formControlFiles.length === 0) {
      this.driverAddForm.get(expiredControl)?.clearValidators();
      this.driverAddForm.get(expiredControl)?.updateValueAndValidity();
    }
  }

  triggerFileUpload(formControlName: string, max: number) {
    this.selectedFormControlName = formControlName;
    this.maxUploadAble = max;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (this.driverAddForm.get(this.selectedFormControlName)?.value) {
      const currentFiles = Array.from(
        this.driverAddForm.get(this.selectedFormControlName)?.value
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

  getDriverImageTitle(menuData: any) {
    if (menuData) {
      switch (menuData) {
        case 'nidFront':
          return 'NID Front';
        case 'nidBack':
          return 'NID Back';
        case 'drivingLicenseFront':
          return 'Driving License Front';
        case 'drivingLicenseBack':
          return 'Driving License Back';
        case 'other':
          return 'Other';
        default:
          return '';
      }
    } else {
      return '';
    }
  }

  onClickClosePopUp(truckImagePop: MatMenu) {
    this.matMenuTrigger.closeMenu();
  }

  onClickImage(preview: any) {
    this.imageGalleryService.setCurrentImage(preview);
    this.dialog.open(ImageGalleryComponent, {});
  }
}
