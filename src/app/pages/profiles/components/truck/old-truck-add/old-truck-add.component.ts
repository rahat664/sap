import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { merge } from 'rxjs';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { PreHireChecklistComponent } from '../pre-hire-checklist/pre-hire-checklist.component';
import { FallbackImagePipe } from '../../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../../shared/directive/image-error.directive';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { registrationZoneList } from '../models/registration-zone';
import { registrationCategoryList } from '../models/registration-category';
import { TruckService } from '../services/truck.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { fileUpload } from '../models/file-upload';
import { truckFileType, TruckFileType } from '../models/truck-file-type';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';

@Component({
  selector: 'app-old-truck-add',
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    NgIf,
    UploadButtonComponent,
    NgClass,
    ReactiveFormsModule,
    PreHireChecklistComponent,
    MatFormField,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    NgForOf,
    MatMenu,
    MatMenuTrigger,
    FallbackImagePipe,
    ImageErrorDirective,
    MatRadioGroup,
    MatRadioButton,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './old-truck-add.component.html',
  styleUrl: './old-truck-add.component.scss',
})
export class OldTruckAddComponent implements OnInit, AfterViewInit {
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
  prehireCheckListOpened = false;
  registrationErrorMessage = '';
  registrationCategoryErrorMessage = '';
  registrationSerialErrorMessage = '';
  registrationNumErrorMessage = '';
  countPassCheckList = 0;
  preHireCheckList: any;
  registrationInput: string;
  loading = false;
  isValidating = false;
  isDuplicateVehicle = false;
  truckImages: any[] = [];
  insuranceImages: any[] = [];
  casePaperImages: any[] = [];
  regPaperImages: any[] = [];
  taxImages: any[] = [];
  fitnessImages: any[] = [];
  routePermitImages: any[] = [];
  othersImages: any[] = [];
  selectedFormControlName: any = '';
  maxUploadAble = 0;

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private toastr: HandleToastrService,
    private router: Router,
    private validation: ValidationService,
    private datePipe: DatePipe,
    private imageGalleryService: ImageGalleryService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.truckAddForm = this.fb.group({
      registrationZone: [null, Validators.required],
      registrationCategory: [null, Validators.required],
      registrationSerial: [
        null,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(2),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      registrationNum: [
        null,
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      ownership: [null, Validators.required],
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

  ngAfterViewInit() {
    this.cd.detectChanges();
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
      registrationZone: this.registrationZonePlaceholder,
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
      registrationCategory: this.registrationInput,
    });
  }

  ngOnInit(): void {
    this.loading = false;
    this.getPrehireChecklist();

    // Number-only validation for serial field
    this.truckAddForm
      .get('registrationSerial')
      ?.valueChanges.subscribe(value => {
        this.numberOnly(value, 'registrationSerial');
        this.registrationSerialErrorMessage =
          this.validation.getRegistrationSerialValidation(
            this.truckAddForm.get('registrationSerial')
          );
      });

    // Number-only validation for num field
    this.truckAddForm
      .get('registrationNum')
      ?.valueChanges.subscribe(value => {
        this.numberOnly(value, 'registrationNum');
        this.registrationNumErrorMessage =
          this.validation.getRegistrationNoValidation(
            this.truckAddForm.get('registrationNum')
          );
      });

    // Create a single merged stream for validation
    const zone$ = this.truckAddForm.get('registrationZone')!.valueChanges;
    const category$ = this.truckAddForm.get('registrationCategory')!.valueChanges;
    const serial$ = this.truckAddForm.get('registrationSerial')!.valueChanges;
    const num$ = this.truckAddForm.get('registrationNum')!.valueChanges;

    merge(zone$, category$, serial$, num$)
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(() => {
        console.log('=== SUBSCRIPTION FIRED ===');
        console.log('Checking registration fields...');
        this.checkAndValidateRegistration();
      });
  }

  private checkAndValidateRegistration(): void {
    const numCtrl = this.truckAddForm.get('registrationNum');
    const serialCtrl = this.truckAddForm.get('registrationSerial');
    const categoryCtrl = this.truckAddForm.get('registrationCategory');
    const zoneCtrl = this.truckAddForm.get('registrationZone');

    const allValid = numCtrl?.valid && serialCtrl?.valid && categoryCtrl?.valid && zoneCtrl?.valid;

    console.log('Field validity:', {
      num: numCtrl?.valid,
      serial: serialCtrl?.valid,
      category: categoryCtrl?.valid,
      zone: zoneCtrl?.valid,
      allValid
    });

    if (allValid) {
      this.validateTruckInformation();
    } else {
      this.isDuplicateVehicle = false;
    }
  }

  onClickSave() {
    // Prevent saving if vehicle is duplicate
    if (this.isDuplicateVehicle) {
      this.toastr.showError('Cannot save: This vehicle is already registered');
      return;
    }

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
      const invalidFields = Object.keys(this.truckAddForm.controls).filter(
        key => this.truckAddForm.controls[key].invalid
      );
      // concat all the invalid fields
      let message = '';
      invalidFields.forEach((field, index) => {
        switch (field) {
          case 'registrationZone':
            field = 'Registration Zone';
            break;
          case 'registrationCategory':
            field = 'Registration Category';
            break;
          case 'registrationSerial':
            field = 'Registration Serial';
            break;
          case 'registrationNum':
            field = 'Registration Number';
            break;
          case 'ownership':
            field = 'Ownership';
            break;
          case 'fitnessCertExpDate':
            field = 'Fitness Certificate Expiry Date';
            break;
          case 'routePermitExpDate':
            field = 'Route Permit Expiry Date';
            break;
          case 'caseExpDate':
            field = 'Case Expiry Date';
            break;
          case 'taxExpDate':
            field = 'Tax Expiry Date';
            break;
          case 'insuranceExpDate':
            field = 'Insurance Expiry Date';
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
      this.registrationErrorMessage = this.validation.getDropdownValidation(
        this.truckAddForm.get('registrationZone')
      );
      this.registrationCategoryErrorMessage =
        this.validation.getDropdownValidation(
          this.truckAddForm.get('registrationCategory')
        );
      this.registrationSerialErrorMessage =
        this.validation.getRegistrationSerialValidation(
          this.truckAddForm.get('registrationSerial')
        );
      this.registrationNumErrorMessage =
        this.validation.getRegistrationNoValidation(
          this.truckAddForm.get('registrationNum')
        );
    }
  }

  private numberOnly(value: any, fieldName: string) {
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      this.truckAddForm.patchValue(
        {
          [fieldName]: value?.replace(/[^0-9]/g, ''),
        },
        { emitEvent: false }
      );
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
    console.log('validateTruckInformation called, isValidating:', this.isValidating);

    // Prevent multiple simultaneous validation calls
    if (this.isValidating) {
      console.log('Already validating, skipping...');
      return;
    }

    // Validate all required fields have values
    const zone = this.truckAddForm.get('registrationZone')?.value;
    const category = this.truckAddForm.get('registrationCategory')?.value;
    const serial = this.truckAddForm.get('registrationSerial')?.value;
    const num = this.truckAddForm.get('registrationNum')?.value;

    console.log('Field values:', { zone, category, serial, num });

    if (!zone || !category || !serial || !num) {
      console.log('Some fields are empty');
      this.isDuplicateVehicle = false;
      return;
    }

    console.log('Making API call to validate registration...');
    this.isValidating = true;
    const body = {
      registeredZone: zone,
      registrationCategory: category,
      registrationSerialNumber: serial,
      registrationNumber: num,
    };

    this.service.validateTruckInformation(body).subscribe({
      next: (res: any) => {
        console.log('API response:', res);
        this.isValidating = false;

        if (res.data == false) {
          // Vehicle is NOT registered (data = false means available)
          console.log('Vehicle is available!');
          this.registrationErrorMessage = '';
          this.registrationCategoryErrorMessage = '';
          this.registrationSerialErrorMessage = '';
          this.registrationNumErrorMessage = '';
          this.isDuplicateVehicle = false;
          console.log('Ready to save!');
        } else {
          // Vehicle is already registered (data = true means duplicate)
          console.log('Vehicle already registered! Showing warning...');
          this.isDuplicateVehicle = true; // Mark as duplicate to disable Save
          this.registrationErrorMessage = 'This vehicle is already registered';
          this.registrationCategoryErrorMessage =
            'This vehicle is already registered';
          this.registrationSerialErrorMessage =
            'This vehicle is already registered';
          this.registrationNumErrorMessage =
            'This vehicle is already registered';
          console.log('Duplicate warning shown, Save button disabled');
        }
      },
      error: (err) => {
        console.error('Validation API error:', err);
        this.isValidating = false;
        // Don't disable form on network errors - allow user to continue
      },
    });
  }


  onDateChange($event: Event, expiryFormControlName: string) {
    let date = ($event.target as HTMLInputElement).value;
    date = this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss');
    this.truckAddForm.patchValue({
      [expiryFormControlName]: date,
    });
  }

  protected readonly truckFileType: TruckFileType[] = truckFileType;
  viewMoreFormControlName: string | undefined;
  viewMoreExpiryControlName: string;

  pdfSrc = 'assets/Angular.pdf';

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
      [this.selectedFormControlName]: [
        ...(this.truckAddForm.get(this.selectedFormControlName)?.value || []),
        ...Array.from(files),
      ],
    });
    switch (this.selectedFormControlName) {
      case 'truckImages':
        this.previewFile(files, this.truckImages);
        break;
      case 'insuranceFiles':
        this.previewFile(files, this.insuranceImages, 'insuranceExpDate');
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
        if (this.taxImages.length > 0) {
          this.truckAddForm
            .get('taxExpDate')
            ?.setValidators([Validators.required]);
          this.truckAddForm.get('taxExpDate')?.updateValueAndValidity();
        }
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
            .get('routePermitExpDate')
            ?.setValidators([Validators.required]);
          this.truckAddForm.get('routePermitExpDate')?.updateValueAndValidity();
        }
        break;
      case 'casePaperFile':
        this.previewFile(files, this.casePaperImages, 'caseExpDate');
        if (this.casePaperImages.length > 0) {
          this.truckAddForm
            .get('caseExpDate')
            ?.setValidators([Validators.required]);
          this.truckAddForm.get('caseExpDate')?.updateValueAndValidity();
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
      this.truckAddForm
        .get(expiredControl)
        ?.setValidators([Validators.required]);
      this.truckAddForm.get(expiredControl)?.updateValueAndValidity();
      this.fileInput.nativeElement.value = '';
    }
  }

  onCloseImage(
    formControlName: string | undefined,
    file: any,
    expiredControl: any
  ) {
    let files: any[] = [];
    switch (formControlName) {
      case 'truckImages':
        this.truckImages = this.truckImages.filter(
          item => item.preview !== file.preview
        );
        files = this.truckImages;
        break;
      case 'insuranceFiles':
        this.insuranceImages = this.insuranceImages.filter(
          item => item.preview !== file.preview
        );
        files = this.insuranceImages;
        break;
      case 'regPaperFile':
        this.regPaperImages = this.regPaperImages.filter(
          item => item.preview !== file.preview
        );
        files = this.regPaperImages;
        break;
      case 'taxFile':
        this.taxImages = this.taxImages.filter(
          item => item.preview !== file.preview
        );
        break;
      case 'fitnessCertificateFile':
        this.fitnessImages = this.fitnessImages.filter(
          item => item.preview !== file.preview
        );
        break;
      case 'routePermitFile':
        this.routePermitImages = this.routePermitImages.filter(
          item => item.preview !== file.preview
        );
        break;
      case 'casePaperFile':
        this.casePaperImages = this.casePaperImages.filter(
          item => item.preview !== file.preview
        );
        break;
      case 'others':
        this.othersImages = this.othersImages.filter(
          item => item.preview !== file.preview
        );
        break;
    }
    const formControlFiles = [];
    files.forEach((file: any) => {
      formControlFiles.push(file.file);
    });
    this.truckAddForm.patchValue({
      [formControlName]: formControlFiles,
    });

    if (formControlFiles.length === 0) {
      this.truckAddForm.get(expiredControl)?.clearValidators();
      this.truckAddForm.get(expiredControl)?.updateValueAndValidity();
    }
  }

  onClickViewMore(truckImagePop: any) {
    this.dialog.open(truckImagePop, {});
  }

  onClickClosePopUp() {
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

  onChangeTruckOwnerShip($event: MatRadioChange) {
    const value = $event?.value;
    this.truckAddForm.get('ownership')?.setValue(value);
  }
}
