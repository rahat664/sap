import { isSuccessStatus } from '../../../../../shared/utils/response-status';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
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
import { MatFormField, MatSuffix } from '@angular/material/form-field';
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
import { provideNativeDateAdapter } from '@angular/material/core';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { MatDialog } from '@angular/material/dialog';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { FallbackImagePipe } from '../../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../../shared/directive/image-error.directive';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-driver-add',
  imports: [
    CommonModule,
    NgIf,
    UploadButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    AlphabetOnlyDirective,
    MatFormField,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatMenu,
    MatSuffix,
    NgForOf,
    MatMenuTrigger,
    NgxMaterialIntlTelInputComponent,
    FallbackImagePipe,
    ImageErrorDirective,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './driver-add.component.html',
  styleUrl: './driver-add.component.scss',
})
export class DriverAddComponent implements OnInit, AfterViewInit {
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
  selectedFormControlName = '';
  maxUploadAble = 0;

  constructor(
    private fb: FormBuilder,
    private validation: ValidationService,
    private router: Router,
    private service: UserService,
    private toastr: HandleToastrService,
    private shared: DriverEditSharedService,
    private datePipe: DatePipe,
    private imageGalleryService: ImageGalleryService,
    private cdr: ChangeDetectorRef
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

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.shared.validateInterNationalPhoneNumber();
    this.driverAddForm.get('driverName').valueChanges.subscribe(() => {
      if (this.driverAddForm.get('driverName').hasError('required')) {
        this.driverNameErrorMessage = 'You must enter a value';
      } else {
        this.driverNameErrorMessage = '';
      }
    });
    this.driverAddForm
      .get('driverPhone')
      .valueChanges.subscribe((value: string) => {
        this.driverPhoneErrorMessage =
          this.validation.getDriverNumberValidation(
            this.driverAddForm.get('driverPhone')
          );
      });
  }

  private onAddFile(files: FileList) {
    const selectedFormControl = this.driverAddForm.get(
      this.selectedFormControlName
    );
    if (selectedFormControl?.value) {
      // concat new files with existing files
      const currentFiles: File[] = Array.from(selectedFormControl.value);
      Array.from(files).forEach((file: File) => {
        currentFiles.push(file);
      });
      this.driverAddForm.patchValue({
        [this.selectedFormControlName]: currentFiles,
      });
    } else {
      this.driverAddForm.patchValue({
        [this.selectedFormControlName]: Array.from(files),
      });
    }
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
          this.driverAddForm
            .get('drivingLicenseExpiryDate')
            ?.updateValueAndValidity();
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
          this.driverAddForm
            .get('drivingLicenseExpiryDate')
            ?.updateValueAndValidity();
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
      // handle if file is a pdf
      if (file.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(file);
        targetArray.push({
          preview: fileURL,
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
      this.fileInput.nativeElement.value = '';
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
      this.loading = true;
      const formData = new FormData();
      const payload: Record<string, any> = {};
      const normalizedPhone = this.normalizePhone(
        this.driverAddForm.get('driverPhone')?.value
      );

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
            payload[key] = normalizedPhone;
          } else {
            payload[key] = value;
          }
        }
      });
      formData.append('payload', JSON.stringify(payload));

      this.service
        .addDriver(formData)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(
        (res: any) => {
          // Handle response
          if (isSuccessStatus(res?.status)) {
            localStorage.removeItem('driver');
            this.setRecentDriver(payload.driverPhone, payload.driverName);
            this.toastr.showSuccess(
              res?.message || 'Driver created successfully'
            );
            this.router.navigate(['/profile/driver']);
          } else {
            this.toastr.showError(res?.message || 'Failed to add driver');
          }
        },
        error => {
          // Handle error
          this.toastr.showError(
            error?.error?.message || error?.message || 'Failed to add driver'
          );
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

  private normalizePhone(phone: string | null | undefined): string {
    return (phone || '').toString().replace(/[\s-]/g, '');
  }

  private setRecentDriver(phone: string, name: string) {
    if (!phone) {
      return;
    }
    localStorage.setItem(
      'recentDriver',
      JSON.stringify({
        phone: phone,
        name: name || '',
        createdAt: new Date().toISOString(),
      })
    );
  }

  getDriverPhoneErrorWithoutTouch() {
    const control = this.driverAddForm?.get('driverPhone');
    if (
      control?.hasError('invalidNumber') ||
      control?.hasError('minlength') ||
      control?.hasError('maxlength') ||
      control?.hasError('minLength') ||
      control?.hasError('maxLength')
    ) {
      return 'Phone number does not match selected country code';
    }
    return '';
  }

  getDriverPhoneErrorWithTouch() {
    const control = this.driverAddForm?.get('driverPhone');
    if (!control) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Driver number required';
    }
    if (
      control.hasError('invalidNumber') ||
      control.hasError('minlength') ||
      control.hasError('maxlength') ||
      control.hasError('minLength') ||
      control.hasError('maxLength')
    ) {
      return 'Phone number does not match selected country code';
    }
    return '';
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

  getDrivingLicenseExpiryError() {
    const control = this.driverAddForm?.get('drivingLicenseExpiryDate');
    if (control?.hasError('required')) {
      return 'Driving license expiry date required';
    }
    return '';
  }

  protected readonly CountryISO = CountryISO;

  get phoneNumber() {
    return this.driverAddForm.get('driverPhone');
  }

  textLabels = {
    mainLabel: 'Mobile Number',
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: '',
    requiredError: '',
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
    date = this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss');
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

  onClickClosePopUp(driverImagePop: MatMenu) {
    this.matMenuTrigger.closeMenu();
  }

  onClickImage(preview: any) {
    this.imageGalleryService.setCurrentImage(preview);
    this.dialog.open(ImageGalleryComponent, {});
  }

  onClickPdfDocument(file: any) {
    this.imageGalleryService.setCurrentImage(file);
    this.dialog.open(ImageGalleryComponent, {
      minHeight: '90vh',
      minWidth: '90%',
      // center the position
      data: {
        images: file.preview,
      },
    });
  }

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }
}
