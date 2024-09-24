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
  protected readonly Date = Date;
  protected readonly truckFileType = truckFileType;
  viewMoreFormControlName: string;
  registrationNumErrorMessage: string;
  registrationSerialErrorMessage: string;
  registrationCategoryErrorMessage: string;
  registrationErrorMessage: string;
  isInEditMode: boolean;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
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
  viewMoreExpiryControlName: string;

  constructor(
    private route: ActivatedRoute,
    private service: TruckService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: HandleToastrService,
    private router: Router,
    private validation: ValidationService
  ) {}

  onSelectRegistrationType($event: number) {
    // Find the selected type based on the event id
    const selectedType = this.registrationListType.find(x => x.id === $event);

    if (selectedType) {
      this.registrationTypePlaceholder = selectedType.value;

      // Update selection status efficiently using a map
      this.registrationListType.forEach(x => {
        x.selected = x.id === $event;
      });

      // Update form value and close the dropdown
      this.registrationOpenedType = false;
      this.truckUpdateForm.patchValue({
        registration_category: this.registrationTypePlaceholder,
      });
    }
  }

  onClickRegistrationType($event: boolean) {
    this.registrationOpenedType = $event;
  }

  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }

  onSelectRegistrationZone(zoneId: number) {
    const selectedZone = this.registrationZoneList.find(x => x.id === zoneId);

    if (selectedZone) {
      this.registrationZonePlaceholder = selectedZone.value;

      // Update the selected status for each zone efficiently
      this.registrationZoneList.forEach(zone => {
        zone.selected = zone.id === zoneId;
      });

      // Close the dropdown and update the form value
      this.registrationZoneOpened = false;
      this.truckUpdateForm.patchValue({
        registration_zone: this.registrationZonePlaceholder,
      });
    }
  }

  ngOnInit(): void {
    this.getTruckDetailsByTruckId();
    this.initiateForm();
  }

  onClickSave() {
    this.loading = true;

    // Early return if form is invalid
    if (!this.truckUpdateForm.valid) {
      this.handleFormErrors();
      return;
    }

    // Set the 'id' field only after form validity is confirmed
    this.truckUpdateForm.get('id')?.setValue(this.truckDetails.id);

    // Check and set default for checklist if it's null
    if (!this.truckUpdateForm.get('checklist')?.value) {
      this.truckUpdateForm.patchValue({ checklist: this.singleChecklist });
    }

    const formData = this.prepareFormData();

    // Send the form data via the service
    this.service.editTruck(formData).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.status === 'OK') {
          this.toastr.showSuccess(res.message);
          this.router.navigate(['/profile/truck']);
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

  // Prepares FormData with files and other form controls
  prepareFormData(): FormData {
    const formData = new FormData();
    const payload: Record<string, any> = {};

    // Iterate over form controls to build the payload and append files
    Object.keys(this.truckUpdateForm.controls).forEach(key => {
      const control = this.truckUpdateForm.get(key);
      const value = control?.value;

      if (this.isFileField(key)) {
        if (value) {
          Array.from(value).forEach((file: any) => formData.append(key, file));
        }
      } else {
        payload[key] = value;
      }
    });

    formData.append('payload', JSON.stringify(payload));
    return formData;
  }

  // Helper to check if the control key corresponds to a file input
  isFileField(key: string): boolean {
    return (
      ['others', 'truckImages', 'insuranceFiles'].includes(key) ||
      key.endsWith('File')
    );
  }

  // Handles form errors and validation messages
  handleFormErrors() {
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

  private numberOnly(value: any) {
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      this.truckUpdateForm.patchValue({
        registration_serial: value?.replace(/[^0-9]/g, ''),
        registration_num: value?.replace(/[^0-9]/g, ''),
      });
    }
  }

  triggerFileUpload(formControlName: string, max: number) {
    this.selectedFormControlName = formControlName;

    // Calculate the number of files that can still be uploaded
    const currentFilesCount =
      this.getSpecificFiles(formControlName)?.length || 0;
    this.maxUploadAble = Math.max(0, max - currentFilesCount); // Ensure it doesn't go negative

    // Trigger the file input click if it exists
    this.fileInput?.nativeElement?.click();
  }

  getSpecificFiles(formControlName?: string, length?: number) {
    const maxFilesAllowed = length ? Math.max(0, 3 - length) : 3; // Ensure length does not go negative

    // Map of form control names to their respective file arrays
    const fileMap: Record<string, any[]> = {
      truckImages: this.truckImages,
      insuranceFiles: this.insuranceImages,
      regPaperFile: this.regPaperImages,
      taxFile: this.taxImages,
      fitnessCertificateFile: this.fitnessImages,
      routePermitFile: this.routePermitImages,
      casePaperFile: this.casePaperImages,
      others: this.othersImages,
    };

    const files = fileMap[formControlName!]; // Use non-null assertion as we've already checked for undefined

    if (files) {
      return files.slice(0, Math.min(files.length, maxFilesAllowed)); // Return the appropriate slice
    }

    return []; // Return an empty array if the formControlName is invalid or no files are found
  }

  getFileArray(formControlName: string) {
    // Map of form control names to their respective file arrays
    const fileMap: Record<string, any[]> = {
      truckImages: this.truckImages,
      insuranceFiles: this.insuranceImages,
      regPaperFile: this.regPaperImages,
      taxFile: this.taxImages,
      fitnessCertificateFile: this.fitnessImages,
      routePermitFile: this.routePermitImages,
      casePaperFile: this.casePaperImages,
      others: this.othersImages,
    };

    // Return the corresponding file array or an empty array if the name is invalid
    return fileMap[formControlName] || [];
  }

  onCloseImage(
    formControlName: string | undefined,
    file: any,
    expiredControl: string
  ) {
    // Map of form control names to their respective image arrays
    const imageMap: Record<string, any[]> = {
      truckImages: this.truckImages,
      insuranceFiles: this.insuranceImages,
      regPaperFile: this.regPaperImages,
      taxFile: this.taxImages,
      fitnessCertificateFile: this.fitnessImages,
      routePermitFile: this.routePermitImages,
      casePaperFile: this.casePaperImages,
      others: this.othersImages,
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
      this.truckUpdateForm.patchValue({ [formControlName]: formControlFiles });

      // Clear validators if no files are left
      if (formControlFiles.length === 0) {
        const control = this.truckUpdateForm.get(expiredControl);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      }
    }
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
      this.truckUpdateForm.patchValue({
        [expiryFormControlName]: formattedDate,
      });
    }
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
    // Map of form control names to their respective titles
    const titleMap: Record<string, string> = {
      regPaperFile: 'Registration paper',
      taxFile: 'Tax paper',
      fitnessCertificateFile: 'Fitness certificate',
      routePermitFile: 'Route permit',
      casePaperFile: 'Case paper',
      others: 'Others document',
      truckImages: 'Truck images',
      insuranceFiles: 'Insurance paper',
    };

    // Return the title based on the form control name or an empty string if not found
    return titleMap[viewMoreFormControlName] || '';
  }

  private getTruckDetailsByTruckId() {
    // Get truck ID from query params
    this.route.paramMap.subscribe(params => {
      const truckId = params.get('id'); // Assuming the truck ID is part of the route parameters

      if (truckId) {
        // Fetch truck details
        this.service.getTruckById(truckId).subscribe(
          (res: any) => {
            if (res && res.data) {
              const truck: TruckModel = res.data;
              this.truckDetails = truck;
              this.documents = truck.truckDocumentList;
              this.updateFormValues(truck);
            } else {
              console.error('Truck details not found in response');
            }
          },
          error => {
            console.error('Error fetching truck details:', error);
            // Handle error (e.g., show a notification)
          }
        );

        // Fetch pre-hire checklist
        this.service.getPreHireChecklist(truckId).subscribe(
          (res: any) => {
            if (res && res.data) {
              // Do something with the pre-hire checklist
              this.preHiredCheckList = res.data;
            } else {
              console.error('Pre-hire checklist not found in response');
            }
          },
          error => {
            console.error('Error fetching pre-hire checklist:', error);
            // Handle error (e.g., show a notification)
          }
        );
      } else {
        console.error('Truck ID is missing in the route parameters.');
        // Handle missing truck ID case (e.g., show a notification)
      }
    });
  }

  private updateFormValues(truck: TruckModel) {
    const formValues = {
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
    };

    // Update the form with the truck values
    this.truckUpdateForm.patchValue(formValues);

    // Set placeholders
    this.registrationZonePlaceholder = truck.registrationZone;
    this.registrationTypePlaceholder = truck.registrationCategory;
  }

  onClickPreHiredChecklist($event: any) {
    this.singleChecklist = $event;
    this.truckUpdateForm.patchValue({ checklist: $event });

    // Count the number of 'PASS' in the checklist
    this.countPassCheckList = Object.values($event).filter(
      status => status === 'PASS'
    ).length;
  }

  private initiateForm() {
    this.truckUpdateForm = this.fb.group({
      id: [null],
      registration_zone: [null],
      registration_category: [null],
      registration_serial: [null],
      registration_num: [null],

      // Expiry Dates
      fitnessCertExpDate: [null],
      routePermitExpDate: [null],
      caseExpDate: [null],
      taxExpDate: [null],
      insuranceExpDate: [null],

      // Files
      regPaperFile: [null],
      taxFile: [null],
      fitnessCertificateFile: [null],
      routePermitFile: [null],
      casePaperFile: [null],
      others: [null],
      checklist: [null],
      insuranceFiles: [null],
      truckImages: [null],
    });
  }

  onClickEdit() {
    this.isInEditMode = true;
  }

  private onAddFile(files: FileList) {
    // Update the form with the selected files
    this.truckUpdateForm.patchValue({
      [this.selectedFormControlName]: files,
    });

    // Handle file preview and validation based on the selected form control
    const validationMap = {
      insuranceFiles: {
        imagesArray: this.insuranceImages,
        expiryField: 'insuranceExpDate',
      },
      fitnessCertificateFile: {
        imagesArray: this.fitnessImages,
        expiryField: 'fitnessCertExpDate',
      },
      routePermitFile: {
        imagesArray: this.routePermitImages,
        expiryField: 'routePermitExpDate',
      },
      casePaperFile: {
        imagesArray: this.casePaperImages,
        expiryField: 'caseExpDate',
      },
      taxFile: {
        imagesArray: this.taxImages,
        expiryField: 'taxExpDate',
      },
    };

    const selectedField = validationMap[this.selectedFormControlName];

    if (selectedField) {
      this.previewFile(files, selectedField.imagesArray);

      if (selectedField.imagesArray.length > 0) {
        this.truckUpdateForm
          .get(selectedField.expiryField)
          ?.setValidators([Validators.required]);
        this.truckUpdateForm
          .get(selectedField.expiryField)
          ?.updateValueAndValidity();
      }
    } else if (
      this.selectedFormControlName === 'truckImages' ||
      this.selectedFormControlName === 'others'
    ) {
      this.previewFile(
        files,
        this.selectedFormControlName === 'truckImages'
          ? this.truckImages
          : this.othersImages
      );
    }
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;

    // Check if files exist
    if (!files || files.length === 0) {
      return;
    }

    const currentFiles =
      this.truckUpdateForm.get(this.selectedFormControlName)?.value || [];
    const totalFilesCount = Array.from(currentFiles).length + files.length;

    // Validate total files count against the maximum allowed
    if (totalFilesCount > this.maxUploadAble) {
      this.toastr.showError(
        `You can upload a maximum of ${this.maxUploadAble} files`
      );
      return;
    }

    // If validation passes, proceed to add files
    this.onAddFile(files);
  }

  checkThatFileIsAvailableOrNot(name: string) {
    const documentTypeMapping: Record<string, TruckDocumentType> = {
      'Registration paper': TruckDocumentType.REG_PAPER_FILE,
      'Tax paper': TruckDocumentType.TAX_FILE,
      'Fitness certificate': TruckDocumentType.FITNESS_CERTIFICATE_FILE,
      'Route permit': TruckDocumentType.ROUTE_PERMIT_FILE,
      'Case paper': TruckDocumentType.CASE_FILE,
      'Others document': TruckDocumentType.OTHER_FILE,
      'Truck images': TruckDocumentType.TRUCK_IMAGE,
      'Insurance paper': TruckDocumentType.INSURANCE_FILE,
    };

    const documentType = documentTypeMapping[name];

    if (!documentType) {
      return [];
    }

    const filteredFiles =
      this.truckDetails?.truckDocumentList.filter(
        x => x.documentType === TruckDocumentType[documentType]
      ) || [];

    // Save the filtered files to the corresponding property
    switch (name) {
      case 'Registration paper':
        this.savedRegistrationPaper = filteredFiles;
        break;
      case 'Tax paper':
        this.savedTaxPaper = filteredFiles;
        break;
      case 'Fitness certificate':
        this.savedFitnessCertificate = filteredFiles;
        break;
      case 'Route permit':
        this.savedRoutePermit = filteredFiles;
        break;
      case 'Case paper':
        this.savedCasePaper = filteredFiles;
        break;
      case 'Others document':
        this.savedOthers = filteredFiles;
        break;
      case 'Truck images':
        this.savedTruckImages = filteredFiles;
        break;
      case 'Insurance paper':
        this.savedInsurancePaper = filteredFiles;
        break;
    }

    // Return the first three files or an empty array
    return filteredFiles.length > 0 ? filteredFiles.slice(0, 3) : [];
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

  private handleTruckAction(action: 'approve' | 'reject', dialogData: any) {
    const dialogComponent =
      action === 'reject' ? ConfirmRejectComponent : ConfirmApproveComponent;

    this.dialog
      .open(dialogComponent, dialogData)
      .afterClosed()
      .subscribe((res: any) => {
        if (action === 'reject' && res.status === 'rejected') {
          this.submitTruckUpdate('Rejected', res.reason);
        } else if (action === 'approve' && res === 'updated') {
          this.submitTruckUpdate('Approved');
        }
      });
  }

  private submitTruckUpdate(status: string, rejectedReason?: string) {
    const formData = new FormData();
    const payload: Record<string, any> = {
      id: this.truckDetails.id,
      status,
      ...(rejectedReason && { rejectedReason }), // Only add if reason is provided
    };

    formData.append('payload', JSON.stringify(payload));
    this.service.editTruck(formData).subscribe(
      (res: any) => {
        // Handle response
        if (res.status === 'OK') {
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

  // Usage in your methods
  onClickReject() {
    const dialogData = {
      title: 'Attention',
      text: `Do you want to reject ${this.truckDetails.fullRegistrationNumber}?`,
      buttonText: 'Reject',
    };
    this.handleTruckAction('reject', dialogData);
  }

  onClickApprove() {
    const dialogData = {
      title: 'Approve',
      text: `Do you want to approve ${this.truckDetails.fullRegistrationNumber}?`,
      buttonText: 'Approve',
    };
    this.handleTruckAction('approve', dialogData);
  }

  private previewFile(
    files: FileList,
    targetArray: { preview: string | ArrayBuffer | null; file: File }[],
    expiredControl?: string // Changed to string to reflect form control name
  ): void {
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();

      // Event listener for file reading completion
      reader.onload = () => {
        targetArray.push({
          preview: reader.result,
          file: file,
        });
      };

      // Event listener for error handling
      reader.onerror = () => {
        console.error(`Error reading file: ${file.name}`);
        this.toastr.showError(`Failed to load ${file.name}`);
      };

      // Start reading the file
      reader.readAsDataURL(file);
    });

    // Handle form control validation if specified
    if (expiredControl) {
      const control = this.truckUpdateForm.get(expiredControl);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
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
        text: this.datePipe.transform(pastDate, 'dd MMM, yyyy') || '',
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

  onCloseImageSavedImage(formControlName: string | undefined, file: any) {
    const savedImagesMap: { [key: string]: any[] } = {
      regPaperFile: this.savedRegistrationPaper,
      taxFile: this.savedTaxPaper,
      fitnessCertificateFile: this.savedFitnessCertificate,
      routePermitFile: this.savedRoutePermit,
      casePaperFile: this.savedCasePaper,
      others: this.savedOthers,
      truckImages: this.savedTruckImages,
      insuranceFiles: this.savedInsurancePaper,
    };

    if (formControlName && savedImagesMap[formControlName]) {
      savedImagesMap[formControlName] = savedImagesMap[formControlName].filter(
        item => item.preSignedFileUrl !== file.preSignedFileUrl
      );
    }
  }
}
