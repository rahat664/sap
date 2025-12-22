import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { registrationZoneList } from '../models/registration-zone';
import { registrationCategoryList } from '../models/registration-category';
import {
  FormBuilder,
  FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TruckService } from '../services/truck.service';
import { PreHireChecklistComponent } from '../pre-hire-checklist/pre-hire-checklist.component';
import { Router } from '@angular/router';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { fileUpload } from '../models/file-upload';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { TruckFileType, truckFileType } from '../models/truck-file-type';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { FallbackImagePipe } from '../../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../../shared/directive/image-error.directive';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { GiveMaxHeightDirective } from '../../../../../shared/directive/give-max-height.directive';
import { GetElementHeightDirective } from '../../../../../shared/directive/get-element-height.directive';
import { TripService } from '../../../../trip-list/services/trip.service';
import { MatSelect } from '@angular/material/select';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { UserService } from '../../../services/user.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatIconButton } from '@angular/material/button';
import { Driver } from '../../../../auth/models/response/trip';

@Component({
  selector: 'app-truck-add',
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
    FormsModule,
    MatTabGroup,
    MatTab,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatTabContent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './truck-add.component.html',
  styleUrl: './truck-add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TruckAddComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  readonly dialog = inject(MatDialog);

  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened = false;
  registrationZonePlaceholder: string;

  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationOpenedType = false;
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
      // Expiry fields (disabled initially)
      fitnessCertExpDate: [{ value: null, disabled: true }],
      routePermitExpDate: [{ value: null, disabled: true }],
      caseExpDate: [{ value: null, disabled: true }],
      taxExpDate: [{ value: null, disabled: true }],
      insuranceExpDate: [{ value: null, disabled: true }],

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
      ownership: [null, [Validators.required]],
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
    this.truckAddForm
      .get('registrationSerial')
      ?.valueChanges.subscribe(value => {
        this.numberOnly(value);
        this.registrationSerialErrorMessage =
          this.validation.getRegistrationSerialValidation(
            this.truckAddForm.get('registrationSerial')
          );
      });
    this.truckAddForm.get('registrationNum')?.valueChanges.subscribe(value => {
      this.numberOnly(value);
      this.registrationNumErrorMessage =
        this.validation.getRegistrationNoValidation(
          this.truckAddForm.get('registrationNum')
        );
    });

    // debounce duplicate-check triggers
    [
      'registrationZone',
      'registrationCategory',
      'registrationSerial',
      'registrationNum',
    ].forEach(ctrl => {
      this.truckAddForm
        .get(ctrl)
        ?.valueChanges.pipe(debounceTime(250), distinctUntilChanged())
        .subscribe(() => {
          if (
            this.truckAddForm.get('registrationNum')?.valid &&
            this.truckAddForm.get('registrationSerial')?.valid &&
            this.truckAddForm.get('registrationCategory')?.valid &&
            this.truckAddForm.get('registrationZone')?.valid
          ) {
            this.validateTruckInformation();
          } else {
            this.everyThingDisabled = true;
            this.toggleExpiryControls(true);
            this.cd.markForCheck();
          }
        });
    });
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
    )?.showname;
    this.registrationInput = this.registrationListType.find(
      option => option.id === $event
    )?.value;
    this.registrationListType.forEach(
      option => (option.selected = option.id === $event)
    );
    this.registrationOpenedType = false;
    this.truckAddForm.patchValue({
      registrationCategory: this.registrationInput,
    });
  }

  // ---------- Save ----------
  onClickSave() {
    this.loading = true;
    if (this.truckAddForm.valid) {
      if (this.truckAddForm.get('checklist')?.value === null) {
        this.truckAddForm.patchValue({ checklist: this.singleChecklist });
      }
      const formData = new FormData();
      const payload: Record<string, any> = {};

      Object.keys(this.truckAddForm.controls).forEach(key => {
        const control = this.truckAddForm.get(key);
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
          payload[key] = value;
        }
      });

      formData.append('payload', JSON.stringify(payload));

      this.service.addTruck(formData).subscribe(
        (res: any) => {
          this.loading = false;
          if (res.status == 'OK') {
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
      this.truckAddForm.markAllAsTouched();
      const invalidFields = Object.keys(this.truckAddForm.controls).filter(
        key => this.truckAddForm.controls[key].invalid
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

      this.cd.markForCheck();
    }
  }

  // ---------- Helpers ----------
  private numberOnly(value: any) {
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      this.truckAddForm.patchValue(
        {
          registrationSerial: value?.replace(/[^0-9]/g, ''),
          registrationNum: value?.replace(/[^0-9]/g, ''),
        },
        { emitEvent: false }
      );
    }
  }

  onClickPrehiredChecklist($event: any) {
    this.countPassCheckList = 0;
    this.prehireCheckListOpened = !$event;
    this.singleChecklist = $event;
    this.truckAddForm.patchValue({ checklist: $event });
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
      registeredZone: this.truckAddForm.get('registrationZone')?.value,
      registrationCategory: this.truckAddForm.get('registrationCategory')
        ?.value,
      registrationSerialNumber:
        this.truckAddForm.get('registrationSerial')?.value,
      registrationNumber: this.truckAddForm.get('registrationNum')?.value,
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
      const ctrl = this.truckAddForm.get(name);
      if (!ctrl) return;
      disabled
        ? ctrl.disable({ emitEvent: false })
        : ctrl.enable({ emitEvent: false });
    });
  }

  // Datepicker (MatDatepickerInputEvent)
  onDateChange($event: any, expiryFormControlName: string) {
    const dateObj: Date | null = $event?.value || null;
    const date = dateObj
      ? this.datePipe.transform(dateObj, 'yyyy-MM-ddTHH:mm:ss')
      : null;
    this.truckAddForm.patchValue({ [expiryFormControlName]: date });
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
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.click();
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
      this.truckAddForm
        .get(expiredControl)
        ?.setValidators([Validators.required]);
      this.truckAddForm.get(expiredControl)?.updateValueAndValidity();
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

    this.truckAddForm.patchValue({
      [formControlName as string]: formControlFiles,
    });

    if (formControlFiles.length === 0 && expiredControl) {
      this.truckAddForm.get(expiredControl)?.clearValidators();
      this.truckAddForm.get(expiredControl)?.updateValueAndValidity();
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

  getSpecificFiles(formControlName: string | undefined) {
    switch (formControlName) {
      case 'truckImages':
        return this.truckImages.length > 3
          ? this.truckImages.slice(0, 3)
          : this.truckImages;
      case 'insuranceFiles':
        return this.insuranceImages.length > 3
          ? this.insuranceImages.slice(0, 3)
          : this.insuranceImages;
      case 'regPaperFile':
        return this.regPaperImages.length > 3
          ? this.regPaperImages.slice(0, 3)
          : this.regPaperImages;
      case 'taxFile':
        return this.taxImages.length > 3
          ? this.taxImages.slice(0, 3)
          : this.taxImages;
      case 'fitnessCertificateFile':
        return this.fitnessImages.length > 3
          ? this.fitnessImages.slice(0, 3)
          : this.fitnessImages;
      case 'routePermitFile':
        return this.routePermitImages.length > 3
          ? this.routePermitImages.slice(0, 3)
          : this.routePermitImages;
      case 'casePaperFile':
        return this.casePaperImages.length > 3
          ? this.casePaperImages.slice(0, 3)
          : this.casePaperImages;
      case 'others':
        return this.othersImages.length > 3
          ? this.othersImages.slice(0, 3)
          : this.othersImages;
      default:
        return [];
    }
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
  onClickImage(preview: any) {
    this.imageGalleryService.setCurrentImage(preview);
    this.dialog.open(ImageGalleryComponent, {});
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
  onChangeTruckOwnerShip($event: MatRadioChange) {
    const value = $event?.value;
    this.truckAddForm.get('ownership')?.setValue(value);
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
    this.truckAddForm.get('driverCode')?.setValue(option.userId);
    this.truckAddForm.get('driverName')?.setValue(option.name);
    this.truckAddForm.get('driverPhone')?.setValue(option.phone);
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
    { id: 1, value: 'DIESEL' },
    { id: 2, value: 'PETROL' },
    { id: 3, value: 'LPG' },
    { id: 4, value: 'CNG' },
    { id: 5, value: 'OCTANE' },
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
    this.truckAddForm.get('size')?.setValue(option.label);
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
    { value: '25ton', label: '25 Ton+' }
  ];
  weightInTon: any;
  vehicleCapacitySuggestion: any;


  onClickClearVehicleSize() {
    this.truckAddForm.get('size')?.setValue(null);
    this.vehicleSize = '';
    this.vehicleSizeSuggestion = [];
    this.cd.markForCheck();
  }

  onClickTripCapacitySuggestion(capacity: any) {
    this.truckAddForm.get('weightInTon')?.setValue(capacity.label);
    this.weightInTon = capacity.label;
    this.vehicleCapacitySuggestion = [];
    this.cd.markForCheck();
  }

  onClickClearVehicleCapacity() {
    this.truckAddForm.get('weightInTon')?.setValue(null);
    this.weightInTon = '';
    this.vehicleCapacitySuggestion = [];
    this.cd.markForCheck();
  }

  onKeyUpVehicleCapacity($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value.toLowerCase();
    if (value?.length > 0) {
      this.vehicleCapacitySuggestion = this.vehicleCapacities.filter(
        capacity => capacity.label.toLowerCase().includes(value)
      );
    } else {
      this.vehicleCapacitySuggestion = [];
    }
    this.cd.markForCheck();
  }
}
