import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { UserModel } from '../../../../user-management/models/user.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
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
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { ConfirmApproveComponent } from '../../../../../shared/modules/confirm-approve/confirm-approve.component';
import { ConfirmRejectComponent } from '../../../../../shared/modules/confirm-reject/confirm-reject.component';
import { FallbackImagePipe } from '../../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../../shared/directive/image-error.directive';

@Component({
  selector: 'app-driver-details',
  imports: [
    NgIf,
    UploadButtonComponent,
    NgClass,
    NgForOf,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDatepicker,
    MatMenu,
    MatMenuTrigger,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatSuffix,
    NgxMaterialIntlTelInputComponent,
    FallbackImagePipe,
    ImageErrorDirective,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './driver-details.component.html',
  styleUrl: './driver-details.component.scss',
})
export class DriverDetailsComponent implements OnInit, AfterViewInit {
  readonly dialog = inject(MatDialog);
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  inEditMode = false;
  singleDriver: UserModel;
  documents: any[] = [];
  driverName: string;
  driverPhone: string;
  protected driverUpdateForm: FormGroup;
  newDriverFileType: any;
  closedDocument: any;
  private deletedFileUrls: any[] = [];
  savedNidFrontFile: any[] = [];
  savedNidBackFile: any[] = [];
  savedDrivingLicenseFrontFile: any[] = [];
  savedDrivingLicenseBackFile: any[] = [];
  savedOtherFile: any[] = [];
  nidFrontFile: any[] = [];
  nidBackFile: any[] = [];
  drivingLicenseFrontFile: any[] = [];
  drivingLicenseBackFile: any[] = [];
  otherFile: any[] = [];
  selectedFormControlName: any;
  maxUploadAble: number;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  constructor(
    private driverEditSharedService: DriverEditSharedService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private service: UserService,
    private datePipe: DatePipe,
    private toastr: HandleToastrService,
    private router: Router,
    private imageGalleryService: ImageGalleryService,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.deletedFileUrls = [];
    if (JSON.parse(localStorage.getItem('directEdit')) === true) {
      this.driverEditSharedService.validateInterNationalPhoneNumber();
      this.isInEditMode = true;
      localStorage.removeItem('directEdit');
    } else {
      this.isInEditMode = false;
    }
    this.getDriverDetailsByDriverId();
    this.initiateForm();
  }

  protected readonly driverFileType: DriverFileType[] = driverFileTypeModel;
  isConfirmModalOpen: boolean;
  viewMoreFormControlName: string;
  isInEditMode: any;
  viewMoreExpiryControlName: string;
  driverDetails: UserModel;
  loading: boolean;

  onClickCancel() {
    this.deletedFileUrls = [];
    this.isInEditMode = false;
    this.savedNidFrontFile = [];
    this.savedNidBackFile = [];
    this.savedDrivingLicenseFrontFile = [];
    this.savedDrivingLicenseBackFile = [];
    this.savedOtherFile = [];
    this.nidFrontFile = [];
    this.nidBackFile = [];
    this.drivingLicenseFrontFile = [];
    this.drivingLicenseBackFile = [];
    this.otherFile = [];
    this.documents = [];
    this.getDriverDetailsByDriverId();
  }

  getSavedFileArray(formControlName: string | undefined) {
    switch (formControlName) {
      case 'nidFront':
        return this.savedNidFrontFile;
      case 'nidBack':
        return this.savedNidBackFile;
      case 'drivingLicenseFront':
        return this.savedDrivingLicenseFrontFile;
      case 'drivingLicenseBack':
        return this.savedDrivingLicenseBackFile;
      case 'other':
        return this.savedOtherFile;
      default:
        return [];
    }
  }

  getDriverImageTitle(viewMoreFormControlName) {
    // Map of form control names to their respective titles
    const titleMap: Record<string, string> = {
      nidFront: 'NID Front',
      nidBack: 'NID Back',
      drivingLicenseFront: 'Driving License Front',
      drivingLicenseBack: 'Driving License Back',
      other: 'Other',
    };

    // Return the title based on the form control name or an empty string if not found
    return titleMap[viewMoreFormControlName] || '';
  }

  onClickClosePopUp() {
    this.matMenuTrigger.closeMenu();
  }

  onClickImage(file: any, type?: string) {
    // if the file is a PDF file, then convert it to blob of a PDF document file is just
    if (type === 'pdf') {
      // this is a blob of the file
      this.imageGalleryService.setCurrentImage(file.preSignedFileUrl);
      this.dialog.open(ImageGalleryComponent, {
        data: {
          images: file.preSignedFileUrl,
          fileType: 'pdf',
          fileName: `${file.documentType}.pdf`,
        },
      });
    } else {
      this.imageGalleryService.setCurrentImage(file.preSignedFileUrl);
      this.dialog.open(ImageGalleryComponent, {
        data: {
          images: file.preSignedFileUrl,
        },
      });
    }
  }

  onCloseImageSavedImage(formControlName: string | undefined, file: any) {
    this.dialog
      .open(ConfirmDeleteComponent, {
        data: {
          title: 'Delete',
          text: `Do you want to delete this file?`,
          buttonText: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res) {
          if (this.deletedFileUrls.length > 0) {
            this.deletedFileUrls.push(file.fileUrl);
          } else {
            this.deletedFileUrls = [file.fileUrl];
          }
          const savedImagesMap: Record<string, any[]> = {
            nidFront: this.savedNidFrontFile,
            nidBack: this.savedNidBackFile,
            drivingLicenseFront: this.savedDrivingLicenseFrontFile,
            drivingLicenseBack: this.savedDrivingLicenseBackFile,
            other: this.savedOtherFile,
          };

          if (formControlName && savedImagesMap[formControlName]) {
            const updatedImages = savedImagesMap[formControlName].filter(
              item => item.preSignedFileUrl !== file.preSignedFileUrl
            );
            switch (formControlName) {
              case 'nidFront':
                this.savedNidFrontFile = updatedImages;
                break;
              case 'nidBack':
                this.savedNidBackFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.driverUpdateForm.get('nidBack').setValue(null);
                }
                break;
              case 'drivingLicenseFront':
                this.savedDrivingLicenseFrontFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.driverUpdateForm
                    .get('drivingLicenseFront')
                    .setValue(null);
                  this.driverUpdateForm
                    .get('drivingLicenseExpiryDate')
                    ?.clearValidators();
                  this.driverUpdateForm
                    .get('drivingLicenseExpiryDate')
                    ?.updateValueAndValidity();
                }
                break;
              case 'drivingLicenseBack':
                this.savedDrivingLicenseBackFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.driverUpdateForm
                    .get('drivingLicenseBack')
                    .setValue(null);
                  this.driverUpdateForm
                    .get('drivingLicenseExpiryDate')
                    ?.clearValidators();
                  this.driverUpdateForm
                    .get('drivingLicenseExpiryDate')
                    ?.updateValueAndValidity();
                }
                break;
              case 'other':
                this.savedOtherFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.driverUpdateForm.get('other').setValue(null);
                }
                break;
            }
          }
        }
      });
  }

  onCloseImage(
    formControlName: string | undefined,
    file: any,
    expiredControl: string
  ) {
    // Map of form control names to their respective image arrays
    const imageMap: Record<string, any[]> = {
      nidFront: this.nidFrontFile,
      nidBack: this.nidBackFile,
      drivingLicenseFront: this.drivingLicenseFrontFile,
      drivingLicenseBack: this.drivingLicenseBackFile,
      other: this.otherFile,
    };

    // Get the corresponding image array based on formControlName
    const images = imageMap[formControlName];

    if (images) {
      // Filter out the file to be removed
      const updatedImages = images.filter(
        item => item.preview !== file.preview
      );

      // Update the image array in the map
      imageMap[formControlName] = updatedImages;

      // Prepare formControlFiles for the patchValue
      const formControlFiles = updatedImages.map(item => item.file);
      this.driverUpdateForm.patchValue({ [formControlName]: formControlFiles });

      // Clear validators if no files are left
      if (formControlFiles.length === 0) {
        const control = this.driverUpdateForm.get(expiredControl);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      }
      switch (formControlName) {
        case 'nidFront':
          this.nidFrontFile = updatedImages;
          if (updatedImages.length === 0) {
            this.driverUpdateForm.get('nidFront').setValue(null);
          }
          break;
        case 'nidBack':
          this.nidBackFile = updatedImages;
          if (updatedImages.length === 0) {
            this.driverUpdateForm.get('nidBack').setValue(null);
          }
          break;
        case 'drivingLicenseFront':
          this.drivingLicenseFrontFile = updatedImages;
          if (updatedImages.length === 0) {
            this.driverUpdateForm.get('drivingLicenseFront').setValue(null);
            this.driverUpdateForm
              .get('drivingLicenseExpiryDate')
              ?.clearValidators();
            this.driverUpdateForm
              .get('drivingLicenseExpiryDate')
              ?.updateValueAndValidity();
          }
          break;
        case 'drivingLicenseBack':
          this.drivingLicenseBackFile = updatedImages;
          if (updatedImages.length === 0) {
            this.driverUpdateForm.get('drivingLicenseBack').setValue(null);
            this.driverUpdateForm
              .get('drivingLicenseExpiryDate')
              ?.clearValidators();
            this.driverUpdateForm
              .get('drivingLicenseExpiryDate')
              ?.updateValueAndValidity();
          }
          break;
        case 'other':
          this.otherFile = updatedImages;
          if (updatedImages.length === 0) {
            this.driverUpdateForm.get('other').setValue(null);
          }
          break;
      }
    }
  }

  getFileArray(formControlName) {
    const fileMap: Record<string, any[]> = {
      nidFront: this.nidFrontFile,
      nidBack: this.nidBackFile,
      drivingLicenseFront: this.drivingLicenseFrontFile,
      drivingLicenseBack: this.drivingLicenseBackFile,
      other: this.otherFile,
    };

    // Return the corresponding file array or an empty array if the name is invalid
    return fileMap[formControlName] || [];
  }

  getSpecificFiles(formControlName: any, max?: any) {
    const maxFilesAllowed = length ? Math.max(0, 3 - length) : 3; // Ensure length does not go negative

    // Map of form control names to their respective file arrays
    const fileMap: Record<string, any[]> = {
      nidFront: this.nidFrontFile,
      nidBack: this.nidBackFile,
      drivingLicenseFront: this.drivingLicenseFrontFile,
      drivingLicenseBack: this.drivingLicenseBackFile,
      other: this.otherFile,
    };

    const files = fileMap[formControlName!]; // Use non-null assertion as we've already checked for undefined

    if (files) {
      return files.slice(0, Math.min(files.length, maxFilesAllowed)); // Return the appropriate slice
    }

    return [];
  }

  triggerFileUpload(formControlName: any, max: any) {
    this.selectedFormControlName = formControlName;

    // Calculate the number of files that can still be uploaded
    const currentFilesCount = this.getSavedFileArray(formControlName)?.length;
    this.maxUploadAble = Math.max(0, max - currentFilesCount); // Ensure it doesn't go negative

    // Trigger the file input click if it exists
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (this.driverUpdateForm.get(this.selectedFormControlName)?.value) {
      const currentFiles = Array.from(
        this.driverUpdateForm.get(this.selectedFormControlName)?.value
      );
      if (currentFiles.length + files.length > this.maxUploadAble) {
        this.toastr.showError(
          `You can upload maximum of ${this.maxUploadAble + this.getSavedFileArray(this.selectedFormControlName)?.length} files`
        );
        return;
      } else {
        this.onAddFile(files);
      }
    } else {
      if (files.length > this.maxUploadAble) {
        this.toastr.showError(
          `You can upload maximum of ${this.maxUploadAble + this.getSavedFileArray(this.selectedFormControlName).length} files`
        );
        return;
      } else {
        this.onAddFile(files);
      }
    }
  }

  private onAddFile(files: FileList) {
    // Update the form with the selected files
    if (this.driverUpdateForm.get(this.selectedFormControlName)?.value) {
      // concat new files with existing files
      const currentFiles = Array.from(
        this.driverUpdateForm.get(this.selectedFormControlName)?.value
      );
      Array.from(files).forEach((file: File) => {
        currentFiles.push(file);
      });
      this.driverUpdateForm.patchValue({
        [this.selectedFormControlName]: currentFiles,
      });
    } else {
      this.driverUpdateForm.patchValue({
        [this.selectedFormControlName]: files,
      });
    }

    // Handle file preview and validation based on the selected form control
    const validationMap = {
      drivingLicenseFront: {
        imagesArray: this.drivingLicenseFrontFile,
        expiryField: 'drivingLicenseExpiryDate',
      },
      drivingLicenseBack: {
        imagesArray: this.drivingLicenseBackFile,
        expiryField: 'drivingLicenseExpiryDate',
      },
    };

    const selectedField = validationMap[this.selectedFormControlName];

    if (selectedField) {
      this.previewFile(files, selectedField.imagesArray);

      if (
        selectedField.expiryField &&
        this.driverUpdateForm.get(this.selectedFormControlName)
      ) {
        this.driverUpdateForm
          .get(selectedField.expiryField)
          ?.setValidators([Validators.required]);
        this.driverUpdateForm
          .get(selectedField.expiryField)
          ?.updateValueAndValidity();
      }
    } else if (
      this.selectedFormControlName === 'nidFront' ||
      this.selectedFormControlName === 'nidBack'
    ) {
      this.previewFile(
        files,
        this.selectedFormControlName === 'nidFront'
          ? this.nidFrontFile
          : this.nidBackFile
      );
    } else if (this.selectedFormControlName === 'other') {
      this.previewFile(files, this.otherFile);
    }
  }

  private previewFile(
    files: FileList,
    targetArray: { preview: string | ArrayBuffer | null; file: File }[],
    expiredControl?: string // Changed to string to reflect form control name
  ): void {
    Array.from(files).forEach((file: File) => {
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

    // Handle form control validation if specified
    if (expiredControl) {
      const control = this.driverUpdateForm.get(expiredControl);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  checkThatFileIsAvailableOrNot(name: string) {
    let filteredFiles: any[] = [];
    switch (name) {
      case 'NID Front':
        filteredFiles = this.savedNidFrontFile;
        break;
      case 'NID Back':
        filteredFiles = this.savedNidBackFile;
        break;
      case 'Driving License Front':
        filteredFiles = this.savedDrivingLicenseFrontFile;
        break;
      case 'Driving License Back':
        filteredFiles = this.savedDrivingLicenseBackFile;
        break;
      case 'Other':
        filteredFiles = this.savedOtherFile;
        break;
    }
    // Return the first three files or an empty array
    return filteredFiles.length > 0 ? filteredFiles.slice(0, 3) : [];
  }

  onDateChange($event: Event, expiryFormControlName: string) {
    const dateInput = ($event.target as HTMLInputElement).value;

    // Transform the date input using datePipe
    const formattedDate = this.datePipe.transform(
      dateInput,
      'yyyy-MM-ddTHH:mm:ss'
    );

    // Patch the form with the formatted date if it's valid
    if (formattedDate) {
      this.driverUpdateForm.patchValue({
        [expiryFormControlName]: formattedDate,
      });
    }
  }

  checkDateIsExpiredOrNot(expiryDate: string): {
    isExpired: boolean;
    text: string;
  } {
    const pastDate = new Date(expiryDate);
    const currentDate = new Date();

    // Normalize time to midnight for accurate comparison
    pastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Check if the past date is today or in the future
    if (pastDate >= currentDate) {
      return {
        isExpired: false,
        text: `Expiry date: ${this.datePipe.transform(pastDate, 'dd MMM, yyyy') || ''}`,
      };
    }

    // Calculate the time difference in milliseconds
    const timeDiff = currentDate.getTime() - pastDate.getTime();

    // Convert milliseconds to days, months, and years
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const yearDiff = Math.floor(dayDiff / 365);
    const monthDiff = Math.floor((dayDiff % 365) / 30);
    const remainingDays = dayDiff % 30;

    // Build the result string
    const resultParts = [];
    if (yearDiff > 0)
      resultParts.push(`${yearDiff} year${yearDiff > 1 ? 's' : ''}`);
    if (monthDiff > 0)
      resultParts.push(`${monthDiff} month${monthDiff > 1 ? 's' : ''}`);
    if (remainingDays > 0)
      resultParts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);

    return {
      isExpired: true,
      text: `Expired ${resultParts.join(', ')} ago`,
    };
  }

  onClickSave() {
    this.loading = true;

    // Early return if form is invalid
    if (!this.driverUpdateForm.valid) {
      this.handleFormErrors();
      return;
    }

    if (this.deletedFileUrls.length > 0) {
      this.deletedFileUrls.forEach(url => {
        this.service.deleteDriverFiles(url, this.driverDetails.id).subscribe(
          (res: any) => {},
          error => {
          }
        );
      });
    }

    // Set the 'id' field only after form validity is confirmed
    this.driverUpdateForm.get('driverId')?.setValue(this.driverDetails.userId);

    // Check and set default for checklist if it's null

    const formData = this.prepareFormData();

    // Send the form data via the service
    this.service.editDriver(formData).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.status === 'OK') {
          this.toastr.showSuccess(res.message);
          this.router.navigate(['/profile/driver']);
        } else {
          this.toastr.showError(res.message);
        }
      },
      error => {
        this.loading = false;
        this.toastr.showError(error?.error?.message || 'An error occurred');
      }
    );
  }

  handleFormErrors() {
    this.driverUpdateForm.markAllAsTouched();
    const invalidFields = Object.keys(this.driverUpdateForm.controls).filter(
      key => this.driverUpdateForm.controls[key].invalid
    );
    // concat all the invalid fields
    let message = '';
    invalidFields.forEach((field, index) => {
      switch (field) {
        case 'driverName':
          field = 'Driver Name';
          break;
        case 'driverPhone':
          field = 'Driver Phone';
          break;
        case 'drivingLicenseExpiryDate':
          field = 'Driving License Expiry Date';
          break;
        default:
          field = field.charAt(0).toUpperCase() + field.slice(1);
          break;
      }
      message += field;
      if (index !== invalidFields.length - 1) {
        message += ', ';
      }
    });
    this.toastr.showError(`Please fill the required fields: ${message}`);
    this.loading = false;
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    const payload: Record<string, any> = {};

    // Iterate over form controls to build the payload and append files
    Object.keys(this.driverUpdateForm.controls).forEach(key => {
      const control = this.driverUpdateForm.get(key);
      const value = control?.value;

      if (this.isFileField(key)) {
        if (value) {
          Array.from(value).forEach((file: any) => formData.append(key, file));
        }
      } else {
        if (key === 'driverPhone') {
          payload[key] = value.replace(/[\s-]/g, '');
        } else {
          payload[key] = value;
        }
      }
    });

    formData.append('payload', JSON.stringify(payload));
    return formData;
  }

  isFileField(key: string): boolean {
    return (
      [
        'other',
        'nidFront',
        'nidBack',
        'drivingLicenseFront',
        'drivingLicenseBack',
      ].includes(key) || key.endsWith('File')
    );
  }

  onClickApprove(driver: UserModel) {
    this.dialog
      .open(ConfirmApproveComponent, {
        data: {
          title: 'Attention',
          textPrefix: 'the driver ',
          text: `the driver ${driver.name} (${driver.phone})?`,
          buttonText: 'Approve',
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res === 'updated') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['driverId'] = driver.userId;
          payload['driverName'] = driver.name;
          payload['driverPhone'] = driver.phone;
          payload['driverStatus'] = 'Approved';
          formData.append('payload', JSON.stringify(payload));
          this.service.editDriver(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
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
        }
      });
  }

  onClickReject(driver: UserModel) {
    this.dialog
      .open(ConfirmRejectComponent, {
        data: {
          title: 'Attention',
          textPrefix: 'the driver ',
          text: `${driver.name} (${driver.phone})?`,
          buttonText: 'Reject',
          reasonAvailable: true,
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res.status === 'rejected') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['driverId'] = driver.userId;
          payload['driverName'] = driver.name;
          payload['driverPhone'] = driver.phone;
          payload['driverStatus'] = 'Rejected';
          payload['rejectedReason'] = res.reason;
          formData.append('payload', JSON.stringify(payload));
          this.service.editDriver(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
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
        }
      });
  }

  onClickEdit() {
    this.isInEditMode = true;
    this.driverEditSharedService.validateInterNationalPhoneNumber();
  }

  private initiateForm() {
    this.driverUpdateForm = this.fb.group({
      driverId: [null],
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

  private getDriverDetailsByDriverId() {
    this.route.paramMap.subscribe(params => {
      const driverId = params.get('id'); // Assuming the truck ID is part of the route parameters

      if (driverId) {
        // Fetch truck details
        this.service.getDriverById(driverId).subscribe(
          (res: any) => {
            if (res && res.data) {
              const driver: UserModel = res.data;
              this.driverDetails = driver;
              this.documents = driver.documentsList;
              // split the document by type
              this.splitDoucumentsByType(this.documents);
              this.updateFormValues(driver);
            } else {
            }
          },
          error => {
            // Handle error (e.g., show a notification)
          }
        );
      } else {
        // Handle missing truck ID case (e.g., show a notification)
      }
    });
  }

  private splitDoucumentsByType(documents: any[]) {
    // Split the documents by type
    documents.forEach(doc => {
      // split by trucj document type
      const documentType = doc.documentType;
      switch (documentType) {
        case 'NID_FRONT':
          this.savedNidFrontFile.push(doc);
          break;
        case 'NID_BACK':
          this.savedNidBackFile.push(doc);
          break;
        case 'DRIVING_LICENSE_FRONT':
          this.savedDrivingLicenseFrontFile.push(doc);
          break;
        case 'DRIVING_LICENSE_BACK':
          this.savedDrivingLicenseBackFile.push(doc);
          break;
        case 'OTHER_FILE':
          this.savedOtherFile.push(doc);
          break;
      }
    });
  }

  private updateFormValues(driver: UserModel) {
    this.driverName = driver.name;
    this.driverPhone = driver.phone;
    this.driverUpdateForm.get('driverName').setValue(this.driverName);
    this.driverUpdateForm.get('driverPhone').setValue(this.driverPhone);
    this.driverUpdateForm
      .get('drivingLicenseExpiryDate')
      .setValue(this.getDrivingLicenseExpiryDate());
  }

  protected readonly CountryISO = CountryISO;

  textLabels = {
    mainLabel: 'Mobile number',
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: '',
    requiredError: 'This field is required',
  };

  get phoneNumber() {
    return this.driverUpdateForm.get('driverPhone');
  }

  getDriverNameError() {
    if (this.driverUpdateForm?.get('driverName').hasError('required')) {
      return 'Driver name required';
    } else if (this.driverUpdateForm?.get('driverName').hasError('minlength')) {
      return 'Invalid driver name';
    } else if (this.driverUpdateForm?.get('driverName').hasError('maxlength')) {
      return 'Invalid driver name';
    } else {
      return '';
    }
  }

  private getDrivingLicenseExpiryDate() {
    const drivingLicenseFront = this.savedDrivingLicenseFrontFile;
    const drivingLicenseBack = this.savedDrivingLicenseBackFile;

    if (drivingLicenseFront.length > 0) {
      return drivingLicenseFront[0].expiryDate;
    } else if (drivingLicenseBack.length > 0) {
      return drivingLicenseBack[0].expiryDate;
    } else {
      return '';
    }
  }

  checkThatFileIsImageOrPdf(file: any) {
    return file.fileUrl.endsWith('.pdf') ? 'pdf' : 'image';
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
}
