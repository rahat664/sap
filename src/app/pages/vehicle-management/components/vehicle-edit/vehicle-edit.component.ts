import { isSuccessStatus } from '../../../../shared/utils/response-status';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { registrationCategoryList } from '../../../profiles/components/truck/models/registration-category';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  truckFileType,
  TruckFileType,
} from '../../../profiles/components/truck/models/truck-file-type';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { Router } from '@angular/router';
import { ValidationService } from '../../../../shared/services/validation/validation.service';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { ImageGalleryService } from '../../../../shared/services/image-gallery/image-gallery.service';
import { TripService } from '../../../trip-list/services/trip.service';
import { UserService } from '../../../profiles/services/user.service';
import { ImageGalleryComponent } from '../../../../shared/modules/image-gallery/image-gallery.component';
import {
  MatRadioButton,
  MatRadioChange,
  MatRadioGroup,
} from '@angular/material/radio';
import { Driver } from '../../../auth/models/response/trip';
import { registrationZoneList } from '../../../profiles/components/truck/models/registration-zone';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { PreHireChecklistComponent } from '../../../profiles/components/truck/pre-hire-checklist/pre-hire-checklist.component';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { MatSelect } from '@angular/material/select';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { TruckDocument, TruckModel } from '../../../profiles/components/truck/models/truck.model';
import { ConfirmDeleteComponent } from '../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { hasPhoneCountryMismatch } from '../../../../shared/utils/phone-validation';

@Component({
  selector: 'app-vehicle-edit',
  imports: [
    ImageErrorDirective,
    MatMenu,
    MatTab,
    PreHireChecklistComponent,
    MatTabContent,
    UploadButtonComponent,
    MatMenuTrigger,
    NgIf,
    MatTabGroup,
    MatFormField,
    ReactiveFormsModule,
    MatSuffix,
    MatDatepickerToggle,
    MatDatepicker,
    GiveMaxHeightDirective,
    MatRadioGroup,
    MatRadioButton,
    GetElementHeightDirective,
    CustomInputComponent,
    GetClickEventDirective,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatDatepickerInput,
    NgClass,
    MatInput,
    FallbackImagePipe,
    NgForOf,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './vehicle-edit.component.html',
  styleUrl: './vehicle-edit.component.scss',
})
export class VehicleEditComponent {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  readonly dialog = inject(MatDialog);
  savedRegistrationPaper: TruckDocument[] = [];
  savedTaxPaper: TruckDocument[] = [];
  savedFitnessCertificate: TruckDocument[] = [];
  savedRoutePermit: TruckDocument[] = [];
  savedCasePaper: TruckDocument[] = [];
  savedOthers: TruckDocument[] = [];
  savedTruckImages: TruckDocument[] = [];
  savedInsurancePaper: TruckDocument[] = [];
  deletedFileUrls: any[] = [];
  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened = false;
  registrationZonePlaceholder: string;

  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationOpenedType = false;
  registrationTypePlaceholder: string;

  truckUpdateForm: FormGroup;

  singleChecklist: any = {};
  prehireCheckListOpened = false;

  registrationErrorMessage = '';
  registrationCategoryErrorMessage = '';
  registrationSerialErrorMessage = '';
  registrationNumErrorMessage = '';
  protected preHiredCheckList: any;

  countPassCheckList = 0;
  preHireCheckList: any;

  registrationInput: string;
  everyThingDisabled = true;
  loading = false;

  truckImages: any[] = [];
  insuranceImages: any[] = [];
  casePaperImages: any[] = [];
  regPaperImages: any[] = [];
  taxImages: any[] = [];
  fitnessImages: any[] = [];
  routePermitImages: any[] = [];
  othersImages: any[] = [];
  selectedFormControlName: string = '';
  maxUploadAble = 0;

  vehicleTypeList: any = ([] = []);
  driverSuggestion: any[] = ([] = []);

  buttonName: any[] = [
    'Today',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Custom',
  ];
  picker: any;
  event: any;
  selectedButton: any;
  startDate: string;
  endDate: string;
  customSelected = false;
  dateSelected = false;
  dateText: any;
  customDateText: any;
  previousFilterLength = 0;
  filterLength = 0;

  protected readonly truckFileType: TruckFileType[] = truckFileType;
  viewMoreFormControlName: string | undefined;
  viewMoreExpiryControlName: string;

  pdfSrc = 'assets/Angular.pdf';
  truckStatus: string = 'Third Party';
  height: string = '0px';
  truckDetails: TruckModel = {} as TruckModel;
  documents: TruckDocument[] = [];

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private toastr: HandleToastrService,
    private router: Router,
    private validation: ValidationService,
    private datePipe: DatePipe,
    private imageGalleryService: ImageGalleryService,
    private cd: ChangeDetectorRef,
    private tripService: TripService,
    private user: UserService
  ) {
    this.truckUpdateForm = this.fb.group({
      id: [null],
      registrationZone: [null],
      registrationCategory: [null],
      registrationSerial: [
        null,
        [
          Validators.minLength(2),
          Validators.maxLength(2),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      registrationNum: [
        null,
        [
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      // Expiry fields (disabled initially)
      fitnessCertExpDate: [{ value: null }],
      routePermitExpDate: [{ value: null }],
      caseExpDate: [{ value: null }],
      taxExpDate: [{ value: null }],
      insuranceExpDate: [{ value: null }],

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

      // Other fields
      ownership: [null],
      type: [null],
      purchaseFrom: [null],
      purchaseDate: [null],
      yard: [null],
      engineNumber: [null],
      chassisNumber: [null],
      size: [null],
      fuelType: [null],
      fuelCapacity: [null],
      weightInTon: [null],
      model: [null],

      // Driver
      driverPhone: [{ value: null, disabled: true }],
      driverName: [null],
      driverCode: [null],
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.loading = false;
    this.getPrehireChecklist();
    this.getVehicleTypeList();

    // validation helpers
    this.truckUpdateForm
      .get('registrationSerial')
      ?.valueChanges.subscribe(value => {
        this.numberOnly(value);
        this.registrationSerialErrorMessage =
          this.validation.getRegistrationSerialValidation(
            this.truckUpdateForm.get('registrationSerial')
          );
      });
    this.truckUpdateForm
      .get('registrationNum')
      ?.valueChanges.subscribe(value => {
        this.numberOnly(value);
        this.registrationNumErrorMessage =
          this.validation.getRegistrationNoValidation(
            this.truckUpdateForm.get('registrationNum')
          );
      });
    // debounce duplicate-check triggers
    this.truckDetails = JSON.parse(localStorage.getItem('vehicleDetails')!);
    this.documents = this.truckDetails.vehicleDocumentList;
    // split the document by type
    this.splitDoucumentsByType(this.documents);
    this.updateFormValues(this.truckDetails);
    // Ensure expiry inputs are disabled until a document exists
    this.syncExpiryControlsWithFiles();
    this.service.getPreHireChecklist(this.truckDetails?.id.toString()).subscribe(
      (res: any) => {
        if (res && res.data) {
          // Do something with the pre-hire checklist
          this.preHiredCheckList = res.data;
          this.countPassCheckList = this.preHiredCheckList.filter(
            (x: any) => {
              return x.status === 'PASS';
            }
          ).length;
        } else {
        }
      },
      error => {
        // Handle error (e.g., show a notification)
      }
    );
  }

  // ---------- Registration dropdown handlers ----------
  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }
  onSelectRegistrationZone($event: number) {
    this.registrationErrorMessage = '';
    this.registrationZonePlaceholder = this.registrationZoneList.find(
      option => option.id === $event
    )?.value;
    this.registrationZoneList.forEach(
      option => (option.selected = option.id === $event)
    );
    this.registrationZoneOpened = false;
    this.truckUpdateForm.patchValue({
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
    )?.showname;
    this.registrationInput = this.registrationListType.find(
      option => option.id === $event
    )?.value;
    this.registrationListType.forEach(
      option => (option.selected = option.id === $event)
    );
    this.registrationOpenedType = false;
    this.truckUpdateForm.patchValue({
      registrationCategory: this.registrationInput,
    });
  }

  // ---------- Save ----------
  onClickSave() {
    this.loading = true;
    if (this.truckUpdateForm.valid) {
      this.truckUpdateForm.get('id')?.setValue(this.truckDetails.id);
      if (this.deletedFileUrls.length > 0) {
        this.deletedFileUrls.forEach(url => {
          this.service.deleteTruckFiles(url, this.truckDetails.id).subscribe(
            (res: any) => {},
            error => {
            }
          );
        });
      }
      if (this.truckUpdateForm.get('checklist')?.value === null) {
        this.truckUpdateForm.patchValue({ checklist: this.singleChecklist });
      }
      const formData = new FormData();
      const payload: Record<string, any> = {};

      Object.keys(this.truckUpdateForm.controls).forEach(key => {
        const control = this.truckUpdateForm.get(key);
        const value = control?.value;

        if (
          key.endsWith('File') ||
          key === 'others' ||
          key === 'truckImages' ||
          key === 'insuranceFiles'
        ) {
          if (value)
            Array.from(value).forEach((file: any) =>
              formData.append(key, file)
            );
        } else {
          // Ensure Date objects are serialized; omit disabled controls
          if (control?.disabled) {
            payload[key] = null;
          } else {
            payload[key] = value instanceof Date
              ? this.datePipe.transform(value, 'yyyy-MM-ddTHH:mm:ss')
              : value;
          }
        }
      });

      formData.append('payload', JSON.stringify(payload));

      this.service.editTruck(formData).subscribe(
        (res: any) => {
          this.loading = false;
          if (isSuccessStatus(res?.status)) {
            this.toastr.showSuccess(res.message);
            this.router.navigate(['/vehicle-management']);
          } else {
            this.toastr.showError(res.message);
          }
          this.cd.markForCheck();
        },
        error => {
          this.loading = false;
          this.toastr.showError(error?.error?.message || 'Failed to save');
          this.cd.markForCheck();
        }
      );
    } else {
      this.truckUpdateForm.markAllAsTouched();
      if (hasPhoneCountryMismatch(this.truckUpdateForm)) {
        this.toastr.showError(
          'Phone number does not match selected country code'
        );
        this.loading = false;
        return;
      }
      const missingExpiryMessage = this.getMissingExpiryDateMessage();
      if (missingExpiryMessage) {
        this.toastr.showError(missingExpiryMessage);
        this.loading = false;
        return;
      }
      const invalidFields = Object.keys(this.truckUpdateForm.controls).filter(
        key => this.truckUpdateForm.controls[key].invalid
      );

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
        message += field + (index !== invalidFields.length - 1 ? ', ' : '');
      });

      this.toastr.showError(`Please fill the required fields: ${message}`);
      this.loading = false;

      this.registrationErrorMessage = this.validation.getDropdownValidation(
        this.truckUpdateForm.get('registrationZone')
      );
      this.registrationCategoryErrorMessage =
        this.validation.getDropdownValidation(
          this.truckUpdateForm.get('registrationCategory')
        );
      this.registrationSerialErrorMessage =
        this.validation.getRegistrationSerialValidation(
          this.truckUpdateForm.get('registrationSerial')
        );
      this.registrationNumErrorMessage =
        this.validation.getRegistrationNoValidation(
          this.truckUpdateForm.get('registrationNum')
        );

      this.cd.markForCheck();
    }
  }

  // ---------- Helpers ----------
  private numberOnly(value: any) {
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      this.truckUpdateForm.patchValue(
        {
          registrationSerial: value?.replace(/[^0-9]/g, ''),
          registrationNum: value?.replace(/[^0-9]/g, ''),
        },
        { emitEvent: false }
      );
    }
  }

  private getMissingExpiryDateMessage(): string | null {
    const expiryChecks = [
      {
        control: 'fitnessCertExpDate',
        message: 'Fitness certificate expiry date required',
      },
      {
        control: 'routePermitExpDate',
        message: 'Route permit expiry date required',
      },
      {
        control: 'caseExpDate',
        message: 'Case expiry date required',
      },
      {
        control: 'taxExpDate',
        message: 'Tax expiry date required',
      },
      {
        control: 'insuranceExpDate',
        message: 'Insurance expiry date required',
      },
    ];

    for (const check of expiryChecks) {
      if (!this.hasAnyFilesForExpiryControl(check.control)) {
        continue;
      }
      const control = this.truckUpdateForm.get(check.control);
      if (control?.disabled) {
        continue;
      }
      if (!control?.value) {
        control.setErrors({ required: true });
        control.markAsTouched();
        return check.message;
      }
    }

    return null;
  }

  onClickPrehiredChecklist($event: any) {
    this.countPassCheckList = 0;
    this.prehireCheckListOpened = !$event;
    this.singleChecklist = $event;
    this.truckUpdateForm.patchValue({ checklist: $event });
    for (const key in $event)
      if ($event[key] === 'PASS') this.countPassCheckList += 1;
  }

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
      registeredZone: this.truckUpdateForm.get('registrationZone')?.value,
      registrationCategory: this.truckUpdateForm.get('registrationCategory')
        ?.value,
      registrationSerialNumber:
        this.truckUpdateForm.get('registrationSerial')?.value,
      registrationNumber: this.truckUpdateForm.get('registrationNum')?.value,
    };
    this.service.validateTruckInformation(body).subscribe({
      next: (res: any) => {
        if (res.data == false) {
          this.registrationErrorMessage = '';
          this.registrationCategoryErrorMessage = '';
          this.registrationSerialErrorMessage = '';
          this.registrationNumErrorMessage = '';
          this.everyThingDisabled = false;
          this.toggleExpiryControls(false);
        } else {
          this.everyThingDisabled = true;
          this.toggleExpiryControls(true);
          this.registrationErrorMessage = 'This vehicle is already registered';
          this.registrationCategoryErrorMessage =
            'This vehicle is already registered';
          this.registrationSerialErrorMessage =
            'This vehicle is already registered';
          this.registrationNumErrorMessage =
            'This vehicle is already registered';
        }
        this.cd.markForCheck();
      },
      error: () => this.cd.markForCheck(),
    });
  }

  private toggleExpiryControls(disabled: boolean) {
    const expiryControls = [
      'fitnessCertExpDate',
      'routePermitExpDate',
      'caseExpDate',
      'taxExpDate',
      'insuranceExpDate',
    ];
    expiryControls.forEach(name => {
      const ctrl = this.truckUpdateForm.get(name);
      if (!ctrl) return;
      disabled
        ? ctrl.disable({ emitEvent: false })
        : ctrl.enable({ emitEvent: false });
    });
  }

  // Enable/disable a specific expiry control
  private setExpiryControlEnabled(expiryControl: string, enabled: boolean) {
    const ctrl = this.truckUpdateForm.get(expiryControl);
    if (!ctrl) return;
    enabled
      ? ctrl.enable({ emitEvent: false })
      : ctrl.disable({ emitEvent: false });
  }

  // Check if there is any file (new or saved) corresponding to an expiry control
  private hasAnyFilesForExpiryControl(expiredControl: string): boolean {
    switch (expiredControl) {
      case 'fitnessCertExpDate':
        return (
          (this.fitnessImages?.length || 0) > 0 ||
          (this.savedFitnessCertificate?.length || 0) > 0
        );
      case 'routePermitExpDate':
        return (
          (this.routePermitImages?.length || 0) > 0 ||
          (this.savedRoutePermit?.length || 0) > 0
        );
      case 'caseExpDate':
        return (
          (this.casePaperImages?.length || 0) > 0 ||
          (this.savedCasePaper?.length || 0) > 0
        );
      case 'taxExpDate':
        return (
          (this.taxImages?.length || 0) > 0 ||
          (this.savedTaxPaper?.length || 0) > 0
        );
      case 'insuranceExpDate':
        return (
          (this.insuranceImages?.length || 0) > 0 ||
          (this.savedInsurancePaper?.length || 0) > 0
        );
      default:
        return false;
    }
  }

  // Sync initial enabled/disabled state based on whether any files exist
  private syncExpiryControlsWithFiles() {
    const mapping: string[] = [
      'fitnessCertExpDate',
      'routePermitExpDate',
      'caseExpDate',
      'taxExpDate',
      'insuranceExpDate',
    ];
    mapping.forEach(ctrlName => {
      const hasFiles = this.hasAnyFilesForExpiryControl(ctrlName);
      this.setExpiryControlEnabled(ctrlName, hasFiles);
    });
  }

  // Datepicker (MatDatepickerInputEvent)
  onDateChange($event: any, expiryFormControlName: string) {
    const dateObj: Date | null = $event?.value || null;
    // Keep Date object in the control so the input displays correctly
    this.truckUpdateForm.patchValue({ [expiryFormControlName]: dateObj });
    this.cd.markForCheck();
  }

  // ---------- (restored) date filter helpers ----------
  onClickFilterButton(event: any, picker: any) {
    this.picker = picker;
    this.event = event;
    this.selectedButton = event;
    if (event === 'Custom') {
      this.startDate = '';
      this.endDate = '';
      this.customSelected = true;
      this.dateSelected = false;
      picker.open();
    } else {
      this.customSelected = false;
      this.dateText = event;
      picker.close();
      if (event === 'Today') {
        this.startDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
        this.endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
      } else if (event === 'Last 7 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 7)),
          'yyyy-MM-dd'
        )!;
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        )!;
      } else if (event === 'Last 15 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 15)),
          'yyyy-MM-dd'
        )!;
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        )!;
      } else if (event === 'Last 30 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 30)),
          'yyyy-MM-dd'
        )!;
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        )!;
      }
    }
  }

  onChangeStartDate($event: Event) {
    this.startDate =
      this.datePipe.transform(
        ($event.target as HTMLInputElement).value,
        'yyyy-MM-dd'
      ) || '';
  }

  onChangeEndDate($event: any) {
    if ($event?.target?.value) {
      this.endDate =
        this.datePipe.transform(
          ($event.target as HTMLInputElement).value,
          'yyyy-MM-dd'
        ) || '';
      this.customDateText = `${this.startDate} - ${this.endDate}`;
      if (!this.dateSelected) {
        this.previousFilterLength += 1;
        this.filterLength += 1;
      }
      this.dateSelected = true;
    } else {
      this.endDate = '';
      if (this.dateSelected && this.filterLength > 1) {
        this.filterLength -= 1;
        this.previousFilterLength -= 1;
      }
    }
  }

  // ---------- Files ----------
  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input?.files;
    if (!files || files.length === 0) return;

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

  triggerFileUpload(formControlName: string, max: number) {
    this.selectedFormControlName = formControlName;
    this.maxUploadAble = max;
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.click();
  }

  private onAddFile(files: FileList) {
    this.truckUpdateForm.patchValue({
      [this.selectedFormControlName]: [
        ...(this.truckUpdateForm.get(this.selectedFormControlName)?.value ||
          []),
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
        if (this.taxImages.length > 0) {
          this.truckUpdateForm
            .get('taxExpDate')
            ?.setValidators([Validators.required]);
          this.truckUpdateForm.get('taxExpDate')?.updateValueAndValidity();
        }
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
            .get('routePermitExpDate')
            ?.setValidators([Validators.required]);
          this.truckUpdateForm
            .get('routePermitExpDate')
            ?.updateValueAndValidity();
        }
        break;
      case 'casePaperFile':
        this.previewFile(files, this.casePaperImages, 'caseExpDate');
        if (this.casePaperImages.length > 0) {
          this.truckUpdateForm
            .get('caseExpDate')
            ?.setValidators([Validators.required]);
          this.truckUpdateForm.get('caseExpDate')?.updateValueAndValidity();
        }
        break;
      case 'others':
        this.previewFile(files, this.othersImages);
        break;
    }
  }

  private previewFile(
    files: FileList,
    targetArray: any[],
    expiredControl?: string
  ) {
    Array.from(files).forEach((file: File) => {
      if (file.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(file);
        targetArray.push({ preview: fileURL, file });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () =>
          targetArray.push({ preview: reader.result, file });
      }
    });

    if (expiredControl) {
      this.truckUpdateForm
        .get(expiredControl)
        ?.setValidators([Validators.required]);
      this.truckUpdateForm.get(expiredControl)?.updateValueAndValidity();
      // Enable the expiry control when there is at least one file
      this.setExpiryControlEnabled(expiredControl, true);
      if (this.fileInput?.nativeElement)
        this.fileInput.nativeElement.value = '';
    }
    this.cd.markForCheck();
  }

  onCloseImage(
    formControlName: string | undefined,
    file: any,
    expiredControl: string
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
        files = this.taxImages;
        break;
      case 'fitnessCertificateFile':
        this.fitnessImages = this.fitnessImages.filter(
          item => item.preview !== file.preview
        );
        files = this.fitnessImages;
        break;
      case 'routePermitFile':
        this.routePermitImages = this.routePermitImages.filter(
          item => item.preview !== file.preview
        );
        files = this.routePermitImages;
        break;
      case 'casePaperFile':
        this.casePaperImages = this.casePaperImages.filter(
          item => item.preview !== file.preview
        );
        files = this.casePaperImages;
        break;
      case 'others':
        this.othersImages = this.othersImages.filter(
          item => item.preview !== file.preview
        );
        files = this.othersImages;
        break;
    }

    try {
      if (file?.file?.type === 'application/pdf' && file?.preview)
        URL.revokeObjectURL(file.preview);
    } catch {}

    const formControlFiles: any[] = [];
    files.forEach((f: any) => formControlFiles.push(f.file));

    this.truckUpdateForm.patchValue({
      [formControlName as string]: formControlFiles,
    });

    if (expiredControl) {
      const hasFiles = this.hasAnyFilesForExpiryControl(expiredControl);
      if (!hasFiles) {
        this.truckUpdateForm.get(expiredControl)?.clearValidators();
        this.truckUpdateForm.get(expiredControl)?.updateValueAndValidity();
        this.setExpiryControlEnabled(expiredControl, false);
      }
    }
    this.cd.markForCheck();
  }

  // ---------- Lookups used by the template (restored) ----------
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

  getTruckImageTitle(menuData: any) {
    if (!menuData) return '';
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
  }

  // ---------- Viewers ----------
  onClickViewMore(truckImagePop: any) {
    this.dialog.open(truckImagePop, {});
  }
  onClickClosePopUp() {
    this.matMenuTrigger.closeMenu();
  }
  onClickImage(file: any, type: string) {
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
  onClickPdfDocument(file: any) {
    this.imageGalleryService.setCurrentImage(file);
    this.dialog.open(ImageGalleryComponent, {
      minHeight: '90vh',
      minWidth: '90%',
      data: { images: file.preview },
    });
  }

  // ---------- Misc ----------
  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) document.body.classList.add(className);
    else document.body.classList.remove(className);
  }

  onChangeTruckStatus(_$event: MatRadioChange) {}
  onChangeTruckOwnerShip($event: any) {
    const value = $event?.value ? $event?.value : $event;
    this.truckUpdateForm.get('ownership')?.setValue(value);
  }
  onChangeTruckType(_$event: any) {}

  onKeyUpDriverSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value?.length > 0) {
      this.user.getDriver(0, 100, value).subscribe((res: any) => {
        this.driverSuggestion = res.data.responses;
        this.cd.markForCheck();
      });
    }
  }
  onClickDriverSearchSuggestion(option: Driver) {
    this.truckUpdateForm.get('driverCode')?.setValue(option.userId);
    this.truckUpdateForm.get('driverName')?.setValue(option.name);
    this.truckUpdateForm.get('driverPhone')?.setValue(option.phone);
    this.cd.markForCheck();
  }

  getAnotherItemsHeight() {
    return Number(this.height.replace('px', '')) - 32 + 'px';
  }

  private getVehicleTypeList() {
    this.tripService.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleTypeList = res.data;
      this.cd.markForCheck();
    });
  }

  // trackBy helpers
  trackByOption = (_: number, opt: TruckFileType) =>
    (opt && (opt as any).formControlName) || _;
  trackByPreview = (_: number, item: any) => item?.preview || _;
  fuelTypeList: any[] = [
    { id: 1, value: 'Diesel' },
    { id: 2, value: 'Petrol' },
    { id: 3, value: 'CNG' },
    { id: 4, value: 'LPG' },
    { id: 5, value: 'Electric' },
  ];
  vehicleSizes = [
    { value: '7ft', label: '7 Feet' },
    { value: '8ft', label: '8 Feet' },
    { value: '10ft', label: '10 Feet' },
    { value: '12ft', label: '12 Feet' },
    { value: '14ft', label: '14 Feet' },
    { value: '16ft', label: '16 Feet' },
    { value: '18ft', label: '18 Feet' },
    { value: '20ft', label: '20 Feet+' },
  ];
  vehicleSizeSuggestion: any;
  vehicleSize: any = '';
  onKeyUpVehicleSize($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value.toLowerCase();
    if (value?.length > 0) {
      this.vehicleSizeSuggestion = this.vehicleSizes.filter(size =>
        size.label.toLowerCase().includes(value)
      );
    } else {
      this.vehicleSizeSuggestion = [];
    }
    this.cd.markForCheck();
  }

  ngOnDestroy(): void {
    const all = [
      ...this.truckImages,
      ...this.insuranceImages,
      ...this.regPaperImages,
      ...this.taxImages,
      ...this.fitnessImages,
      ...this.routePermitImages,
      ...this.casePaperImages,
      ...this.othersImages,
    ];
    all.forEach(f => {
      try {
        if (f?.file?.type === 'application/pdf' && f?.preview)
          URL.revokeObjectURL(f.preview);
      } catch {}
    });
  }

  onClickTripSizeSuggestion(option: any) {
    this.truckUpdateForm.get('size')?.setValue(option.label);
    this.vehicleSize = option.label;
    this.vehicleSizeSuggestion = [];
    this.cd.markForCheck();
  }
  vehicleCapacities = [
    { value: '0.5ton', label: '0.5 Ton' },
    { value: '1ton', label: '1 Ton' },
    { value: '1.5ton', label: '1.5 Ton' },
    { value: '2ton', label: '2 Ton' },
    { value: '2.5ton', label: '2.5 Ton' },
    { value: '3ton', label: '3 Ton' },
    { value: '3.5ton', label: '3.5 Ton' },
    { value: '4ton', label: '4 Ton' },
    { value: '5ton', label: '5 Ton' },
    { value: '6ton', label: '6 Ton' },
    { value: '7ton', label: '7 Ton' },
    { value: '8ton', label: '8 Ton' },
    { value: '10ton', label: '10 Ton' },
    { value: '12ton', label: '12 Ton' },
    { value: '15ton', label: '15 Ton' },
    { value: '20ton', label: '20 Ton' },
    { value: '25ton', label: '25 Ton+' },
  ];
  weightInTon: any;
  vehicleCapacitySuggestion: any;
  isInEditMode: boolean = true;

  onClickClearVehicleSize() {
    this.truckUpdateForm.get('size')?.setValue(null);
    this.vehicleSize = '';
    this.vehicleSizeSuggestion = [];
    this.cd.markForCheck();
  }

  onClickTripCapacitySuggestion(capacity: any) {
    this.truckUpdateForm.get('weightInTon')?.setValue(capacity.label);
    this.weightInTon = capacity.label;
    this.vehicleCapacitySuggestion = [];
    this.cd.markForCheck();
  }

  onClickClearVehicleCapacity() {
    this.truckUpdateForm.get('weightInTon')?.setValue(null);
    this.weightInTon = '';
    this.vehicleCapacitySuggestion = [];
    this.cd.markForCheck();
  }

  onKeyUpVehicleCapacity($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value.toLowerCase();
    if (value?.length > 0) {
      this.vehicleCapacitySuggestion = this.vehicleCapacities.filter(capacity =>
        capacity.label.toLowerCase().includes(value)
      );
    } else {
      this.vehicleCapacitySuggestion = [];
    }
    this.cd.markForCheck();
  }
  checkThatFileIsAvailableOrNot(name: string) {
    let filteredFiles = [];
    switch (name) {
      case 'Registration paper':
        filteredFiles = this.savedRegistrationPaper;
        break;
      case 'Tax paper':
        filteredFiles = this.savedTaxPaper;
        break;
      case 'Fitness certificate':
        filteredFiles = this.savedFitnessCertificate;
        break;
      case 'Route permit':
        filteredFiles = this.savedRoutePermit;
        break;
      case 'Case paper':
        filteredFiles = this.savedCasePaper;
        break;
      case 'Others document':
        filteredFiles = this.savedOthers;
        break;
      case 'Truck images':
        filteredFiles = this.savedTruckImages;
        break;
      case 'Insurance paper':
        filteredFiles = this.savedInsurancePaper;
        break;
    }
    // Return the first three files or an empty array
    return filteredFiles.length > 0 ? filteredFiles.slice(0, 3) : [];
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

  checkThatFileIsImageOrPdf(file: any) {
    return file.fileUrl.endsWith('.pdf') ? 'pdf' : 'image';
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
            const updatedImages = savedImagesMap[formControlName].filter(
              item => item.preSignedFileUrl !== file.preSignedFileUrl
            );
            switch (formControlName) {
              case 'regPaperFile':
                this.savedRegistrationPaper = updatedImages;
                break;
              case 'taxFile':
                this.savedTaxPaper = updatedImages;
                if (updatedImages.length === 0) {
                  this.truckUpdateForm.get('taxFile').setValue(null);
                  this.truckUpdateForm.get('taxExpDate')?.clearValidators();
                  this.truckUpdateForm
                    .get('taxExpDate')
                    ?.updateValueAndValidity();
                  if ((this.taxImages?.length || 0) === 0)
                    this.setExpiryControlEnabled('taxExpDate', false);
                }
                break;
              case 'fitnessCertificateFile':
                this.savedFitnessCertificate = updatedImages;
                if (updatedImages.length === 0) {
                  this.truckUpdateForm
                    .get('fitnessCertificateFile')
                    .setValue(null);
                  this.truckUpdateForm
                    .get('fitnessCertExpDate')
                    ?.clearValidators();
                  this.truckUpdateForm
                    .get('fitnessCertExpDate')
                    ?.updateValueAndValidity();
                  if ((this.fitnessImages?.length || 0) === 0)
                    this.setExpiryControlEnabled('fitnessCertExpDate', false);
                }
                break;
              case 'routePermitFile':
                this.savedRoutePermit = updatedImages;
                if (updatedImages.length === 0) {
                  this.truckUpdateForm.get('routePermitFile').setValue(null);
                  this.truckUpdateForm
                    .get('routePermitExpDate')
                    ?.clearValidators();
                  this.truckUpdateForm
                    .get('routePermitExpDate')
                    ?.updateValueAndValidity();
                  if ((this.routePermitImages?.length || 0) === 0)
                    this.setExpiryControlEnabled('routePermitExpDate', false);
                }
                break;
              case 'casePaperFile':
                this.savedCasePaper = updatedImages;
                if (updatedImages.length === 0) {
                  this.truckUpdateForm.get('casePaperFile').setValue(null);
                  this.truckUpdateForm.get('caseExpDate')?.clearValidators();
                  this.truckUpdateForm
                    .get('caseExpDate')
                    ?.updateValueAndValidity();
                  if ((this.casePaperImages?.length || 0) === 0)
                    this.setExpiryControlEnabled('caseExpDate', false);
                }
                break;
              case 'others':
                this.savedOthers = updatedImages;
                break;
              case 'truckImages':
                this.savedTruckImages = updatedImages;
                break;
              case 'insuranceFiles':
                this.savedInsurancePaper = updatedImages;
                if (updatedImages.length === 0) {
                  this.truckUpdateForm.get('insuranceFiles').setValue(null);
                  this.truckUpdateForm
                    .get('insuranceExpDate')
                    ?.clearValidators();
                  this.truckUpdateForm
                    .get('insuranceExpDate')
                    ?.updateValueAndValidity();
                  if ((this.insuranceImages?.length || 0) === 0)
                    this.setExpiryControlEnabled('insuranceExpDate', false);
                }
                break;
            }
          }
        }
      });
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


  private splitDoucumentsByType(documents: TruckDocument[]) {
    // Split the documents by type
    documents.forEach(doc => {
      // split by truck document type
      const documentType = doc.documentType;
      switch (documentType) {
        case 'REG_PAPER_FILE':
          this.savedRegistrationPaper.push(doc);
          break;
        case 'TAX_FILE':
          this.savedTaxPaper.push(doc);
          break;
        case 'FITNESS_CERTIFICATE_FILE':
          this.savedFitnessCertificate.push(doc);
          break;
        case 'ROUTE_PERMIT_FILE':
          this.savedRoutePermit.push(doc);
          break;
        case 'CASE_FILE':
          this.savedCasePaper.push(doc);
          break;
        case 'OTHER_FILE':
          this.savedOthers.push(doc);
          break;
        case 'TRUCK_IMAGE':
          this.savedTruckImages.push(doc);
          break;
        case 'INSURANCE_FILE':
          this.savedInsurancePaper.push(doc);
          break;
      }
    });
  }
  private updateFormValues(truck: TruckModel) {
    const formValues = {
      registrationZone: truck.registrationZone,
      registrationCategory: truck.registrationCategory,
      registrationSerial: truck.registrationSerial,
      registrationNum: truck.registrationNum,
      fitnessCertExpDate: this.getExpireDate('FITNESS_CERTIFICATE_FILE'),
      routePermitExpDate: this.getExpireDate('ROUTE_PERMIT_FILE'),
      caseExpDate: this.getExpireDate('CASE_FILE'),
      taxExpDate: this.getExpireDate('TAX_FILE'),
      insuranceExpDate: this.getExpireDate('INSURANCE_FILE'),
      regPaperFile: truck.regPaperFile,
      taxFile: truck.taxFile,
      ownership: truck.ownership,
      type: truck.type,
      purchaseFrom: truck.purchaseFrom,
      purchaseDate: truck.purchaseDate ? new Date(truck.purchaseDate) : null,
      yard: truck.yard,
      size: truck.size,
      engineNumber: truck.engineNumber,
      chassisNumber: truck.chassisNumber,
      weightInTon: truck.weightInTon,
      fuelType: truck.fuelType,
      model: truck.model,
      fuelCapacity: truck.fuelCapacity,
      driverPhone: truck.driverPhone,
      driverName: truck.driverName,
      driverCode: truck.driverCode,
    };

    // Update the form with the truck values
    this.truckUpdateForm.patchValue(formValues);

    // Set placeholders
    this.registrationZonePlaceholder = truck.registrationZone;
    this.registrationTypePlaceholder = truck.registrationCategory;
  }

  private getExpireDate(fitnesscertificatefile: string): Date | null {
    const doc = this.documents.find(
      doc => doc.documentType === fitnesscertificatefile
    );
    return doc?.expiryDate ? new Date(doc.expiryDate) : null;
  }

  onClickPreHiredChecklist($event: any) {
    this.singleChecklist = $event;
    this.truckUpdateForm.patchValue({ checklist: $event });

    const newCheckList = JSON.parse(JSON.stringify(this.preHiredCheckList));
    newCheckList.forEach((category: any) => {
      Object.keys($event).forEach((key: any) => {
        if (category.checklistId == key) {
          category.status = $event[key];
        }
      });
    });
    this.countPassCheckList = newCheckList.filter(
      (x: any) => x.status === 'PASS'
    ).length;
  }
}
