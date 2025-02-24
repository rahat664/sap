import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FallbackImagePipe } from '../../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../../shared/directive/image-error.directive';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Transporter,
  TransporterDocument,
} from '../models/transporter-details.model';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { transporterFileTypeModel } from '../../truck/models/transporter-file-type';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { ConfirmDeleteComponent } from '../../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { TransporterDocumentType } from '../../../../../shared/Enums/registration_type';

@Component({
  selector: 'app-transporter-details',
  imports: [
    FallbackImagePipe,
    ImageErrorDirective,
    MatDatepicker,
    MatDatepickerInput,
    NgIf,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    MatSuffix,
    NgForOf,
    ReactiveFormsModule,
    UploadButtonComponent,
    NgClass,
    MatMenuTrigger,
    MatMenu,
  ],
  templateUrl: './transporter-details.component.html',
  styleUrl: './transporter-details.component.scss',
})
export class TransporterDetailsComponent {
  readonly dialog = inject(MatDialog);
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  transporterFileType = transporterFileTypeModel;
  transporterId: any;
  transporter: Transporter;
  isInEditMode: boolean;
  loading: boolean;
  savedTransporterImageFile: any[] = [];
  savedNidFrontFile: any[] = [];
  savedNidBackFile: any[] = [];
  savedTradeLicenseFile: any[] = [];
  transporterUpdateForm: FormGroup;
  nidFrontFile: any[] = [];
  nidBackFile: any[] = [];
  profilePictureFile: any[] = [];
  tradeLicenseFile: any[] = [];
  deletedFileUrls: any[] = [];
  viewMoreFormControlName: string = '';
  selectedFormControlName: any;
  maxUploadAble: number;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  viewMoreExpiryControlName: string;

  constructor(
    private service: UserService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private imageGalleryService: ImageGalleryService,
    private toastr: HandleToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    // get transporter id from param
    this.route.params.subscribe(params => {
      this.transporterId = params['id'];
      this.getTransporterId();
    });
    this.initializeForm();
  }

  private getTransporterId() {
    this.service
      .getTransporterById(this.transporterId)
      .subscribe((res: any) => {
        this.transporter = res.data;
        this.separateFilesByDocumentType(this.transporter?.documentsList);
      });
  }

  onClickSave() {}

  onClickCancel() {
    this.isInEditMode = false;
  }

  onClickApprove(driverDetails: any) {}

  onClickReject(driverDetails: any) {}

  onClickEdit() {
    this.isInEditMode = true;
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
      case 'Profile Picture':
        filteredFiles = this.savedTransporterImageFile;
        break;
      case 'Trade License':
        filteredFiles = this.savedTradeLicenseFile;
        break;
    }
    // Return the first three files or an empty array
    return filteredFiles.length > 0 ? filteredFiles.slice(0, 3) : [];
  }

  private initializeForm() {
    this.transporterUpdateForm = this.fb.group({
      name: [''],
      phone: [''],
      truckStand: [''],
      preferredPaymentMethod: [''],
      bkashName: [''],
      bkashNumber: [''],
      bkashType: [''],
      bankName: [''],
      bankBranch: [''],
      bankAccountName: [''],
      bankAccountNumber: [''],
      role: [''],
      note: [''],
      nidFront: [''],
      nidBack: [''],
      profilePicture: [''],
      tradeLicense: [''],
    });
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

  onDateChange($event: Event, expiryFormControlName: string) {
    const dateInput = ($event.target as HTMLInputElement).value;

    // Transform the date input using datePipe
    const formattedDate = this.datePipe.transform(
      dateInput,
      'yyyy-MM-ddTHH:mm:ss'
    );

    // Patch the form with the formatted date if it's valid
    if (formattedDate) {
      this.transporterUpdateForm.patchValue({
        [expiryFormControlName]: formattedDate,
      });
    }
  }

  getSpecificFiles(formControlName: any, max?: any) {
    const maxFilesAllowed = length ? Math.max(0, 3 - length) : 3; // Ensure length does not go negative

    // Map of form control names to their respective file arrays
    const fileMap: Record<string, any[]> = {
      nidFront: this.nidFrontFile,
      nidBack: this.nidBackFile,
      profilePicture: this.profilePictureFile,
      tradeLicense: this.tradeLicenseFile,
    };

    const files = fileMap[formControlName!]; // Use non-null assertion as we've already checked for undefined

    if (files) {
      return files.slice(0, Math.min(files.length, maxFilesAllowed)); // Return the appropriate slice
    }

    return [];
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

  onCloseImage(
    formControlName: string | undefined,
    file: any,
    expiredControl: string
  ) {
    // Map of form control names to their respective image arrays
    const imageMap: Record<string, any[]> = {
      nidFront: this.nidFrontFile,
      nidBack: this.nidBackFile,
      profilePicture: this.profilePictureFile,
      tradeLicense: this.tradeLicenseFile,
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
      this.transporterUpdateForm.patchValue({
        [formControlName]: formControlFiles,
      });

      // Clear validators if no files are left
      if (formControlFiles.length === 0) {
        const control = this.transporterUpdateForm.get(expiredControl);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      }
      switch (formControlName) {
        case 'nidFront':
          this.nidFrontFile = updatedImages;
          if (updatedImages.length === 0) {
            this.transporterUpdateForm.get('nidFront').setValue(null);
          }
          break;
        case 'nidBack':
          this.nidBackFile = updatedImages;
          if (updatedImages.length === 0) {
            this.transporterUpdateForm.get('nidBack').setValue(null);
          }
          break;
        case 'profilePicture':
          this.profilePictureFile = updatedImages;
          if (updatedImages.length === 0) {
            this.transporterUpdateForm.get('profilePicture').setValue(null);
          }
          break;
        case 'tradeLicense':
          this.tradeLicenseFile = updatedImages;
          if (updatedImages.length === 0) {
            this.transporterUpdateForm.get('tradeLicense').setValue(null);
          }
          break;
      }
    }
  }

  checkThatFileIsImageOrPdf(file: any) {
    return file.fileUrl.endsWith('.pdf') ? 'pdf' : 'image';
  }

  onClickImage(file: any, type: string, documentName: string) {
    // if the file is a PDF file, then convert it to blob of a PDF document file is just
    debugger;
    this.router.navigate(['/profile/document-viewer'], {
      state: {
        tripDocuments: [file],
        imageType: documentName,
        expiryAvailable: false,
        noteAvailable: false,
        activatedDocument: file,
        returnUrl: `/profile/${this.transporterId}/details`,
        tripId: this.transporterId,
      },
    });
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
            profilePicture: this.savedTransporterImageFile,
            tradeLicense: this.savedTradeLicenseFile,
          };

          if (formControlName && savedImagesMap[formControlName]) {
            const updatedImages = savedImagesMap[formControlName].filter(
              item => item.preSignedFileUrl !== file.preSignedFileUrl
            );
            switch (formControlName) {
              case 'nidFront':
                this.savedNidFrontFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.transporterUpdateForm.get('nidFront').setValue(null);
                }
                break;
              case 'nidBack':
                this.savedNidBackFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.transporterUpdateForm.get('nidBack').setValue(null);
                }
                break;
              case 'profilePicture':
                this.savedTransporterImageFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.transporterUpdateForm
                    .get('profilePicture')
                    .setValue(null);
                }
                break;
              case 'tradeLicense':
                this.savedTradeLicenseFile = updatedImages;
                if (updatedImages.length === 0) {
                  this.transporterUpdateForm.get('tradeLicense').setValue(null);
                }
                break;
            }
          }
        }
      });
  }

  getSavedFileArray(formControlName: string | undefined) {
    switch (formControlName) {
      case 'nidFront':
        return this.savedNidFrontFile;
      case 'nidBack':
        return this.savedNidBackFile;
      case 'profilePicture':
        return this.savedTransporterImageFile;
      case 'tradeLicense':
        return this.savedTradeLicenseFile;
      default:
        return [];
    }
  }

  getFileArray(formControlName) {
    const fileMap: Record<string, any[]> = {
      nidFront: this.nidFrontFile,
      nidBack: this.nidBackFile,
      profilePicture: this.profilePictureFile,
      tradeLicense: this.tradeLicenseFile,
    };

    // Return the corresponding file array or an empty array if the name is invalid
    return fileMap[formControlName] || [];
  }

  getTransporterImageTitle(viewMoreFormControlName) {
    // Map of form control names to their respective titles
    const titleMap: Record<string, string> = {
      nidFront: 'NID Front',
      nidBack: 'NID Back',
      profilePicture: 'Transporter Image',
      tradeLicense: 'Trade License',
    };

    // Return the title based on the form control name or an empty string if not found
    return titleMap[viewMoreFormControlName] || '';
  }

  onClickClosePopUp() {
    this.matMenuTrigger.closeMenu();
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
    if (this.transporterUpdateForm.get(this.selectedFormControlName)?.value) {
      const currentFiles = Array.from(
        this.transporterUpdateForm.get(this.selectedFormControlName)?.value
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
    if (this.transporterUpdateForm.get(this.selectedFormControlName)?.value) {
      // concat new files with existing files
      const currentFiles = Array.from(
        this.transporterUpdateForm.get(this.selectedFormControlName)?.value
      );
      Array.from(files).forEach((file: File) => {
        currentFiles.push(file);
      });
      this.transporterUpdateForm.patchValue({
        [this.selectedFormControlName]: currentFiles,
      });
    } else {
      this.transporterUpdateForm.patchValue({
        [this.selectedFormControlName]: files,
      });
    }

    this.previewFile(files, this.selectedFormControlName);
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
      const control = this.transporterUpdateForm.get(expiredControl);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  private separateFilesByDocumentType(
    documentsList: TransporterDocument[] | undefined
  ) {
    if (documentsList) {
      documentsList.forEach((document: TransporterDocument) => {
        switch (document.documentType) {
          case TransporterDocumentType[TransporterDocumentType.NID_FRONT]:
            this.savedNidFrontFile.push(document);
            break;
          case TransporterDocumentType[TransporterDocumentType.NID_BACK]:
            this.savedNidBackFile.push(document);
            break;
          case TransporterDocumentType[TransporterDocumentType.PROFILE_PICTURE]:
            this.savedTransporterImageFile.push(document);
            break;
          case TransporterDocumentType[TransporterDocumentType.TRADE_LICENSE]:
            this.savedTradeLicenseFile.push(document);
            break;
        }
      });
    }
  }
}
