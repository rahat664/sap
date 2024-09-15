import { Component, inject, OnInit } from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { NgClass, NgForOf, NgIf } from '@angular/common';
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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './truck-add.component.html',
  styleUrl: './truck-add.component.scss',
})
export class TruckAddComponent implements OnInit {
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
  isExpiryAvailable: boolean;
  registrationErrorMessage = '';
  registrationCategoryErrorMessage = '';
  registrationSerialErrorMessage = '';
  registrationNumErrorMessage = '';
  countPassCheckList: number = 0;
  preHireCheckList: any;
  private registrationInput: string;
  everyThingDisabled: boolean = true;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private toastr: HandleToastrService,
    private router: Router,
    private validation: ValidationService
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
    this.truckAddForm.valueChanges.subscribe(() => {
      if (this.truckAddForm.valid) {
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
        console.log(value);

        if (
          key.endsWith('File') ||
          key === 'others' ||
          key === 'truckImages' ||
          key === 'insuranceFiles'
        ) {
          if (key == 'truckImages' || key == 'insuranceFiles') {
            // Append multiple files to the FormData
            if (value) {
              value.forEach((file: any) => {
                formData.append(key, file);
              });
            }
          } else {
            // Append single file to the FormData
            if (value) {
              formData.append(key, value);
            }
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
            this.TruckFileUrls = [];
            this.InsuranceFileUrls = [];
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

  private TruckFileUrls: any[] = [];
  private InsuranceFileUrls: any[] = [];

  onAddFile($event: any) {
    // remove all validation
    this.truckAddForm.get('fitnessCertExpDate').clearValidators();
    this.truckAddForm.get('fitnessCertExpDate').updateValueAndValidity();
    this.truckAddForm.get('routePermitExpDate').clearValidators();
    this.truckAddForm.get('routePermitExpDate').updateValueAndValidity();
    this.truckAddForm.get('taxExpDate').clearValidators();
    this.truckAddForm.get('taxExpDate').updateValueAndValidity();
    this.truckAddForm.get('caseExpDate').clearValidators();
    this.truckAddForm.get('caseExpDate').updateValueAndValidity();
    this.truckAddForm.get('insuranceExpDate').clearValidators();
    this.truckAddForm.get('insuranceExpDate').updateValueAndValidity();
    this.TruckFileUrls = [];
    this.InsuranceFileUrls = [];
    $event.forEach((file: any) => {
      switch (file.registrationType) {
        case 'Truck Image':
          this.TruckFileUrls.push(file.file);
          this.truckAddForm.patchValue({
            truckImages: this.TruckFileUrls,
          });
          break;
        case 'Registration Paper':
          this.truckAddForm.patchValue({
            regPaperFile: file.file,
          });
          break;
        case 'Fitness':
          this.isExpiryAvailable = true;
          this.truckAddForm.patchValue({
            fitnessCertificateFile: file.file,
            fitnessCertExpDate: file.registrationExpireDate,
          });
          this.truckAddForm
            .get('fitnessCertExpDate')
            .setValidators([Validators.required]);
          this.truckAddForm.get('fitnessCertExpDate').updateValueAndValidity();
          break;
        case 'Route Permit':
          this.isExpiryAvailable = true;
          this.truckAddForm.patchValue({
            routePermitFile: file.file,
            routePermitExpDate: file.registrationExpireDate,
          });
          this.truckAddForm
            .get('routePermitExpDate')
            .setValidators([Validators.required]);
          this.truckAddForm.get('routePermitExpDate').updateValueAndValidity();
          break;
        case 'Tax':
          this.truckAddForm.patchValue({
            taxFile: file.file,
            taxExpDate: file.registrationExpireDate,
          });
          this.truckAddForm
            .get('taxExpDate')
            .setValidators([Validators.required]);
          this.truckAddForm.get('taxExpDate').updateValueAndValidity();
          break;
        case 'Case':
          this.truckAddForm.patchValue({
            casePaperFile: file.file,
            caseExpDate: file.registrationExpireDate,
          });
          this.truckAddForm
            .get('caseExpDate')
            .setValidators([Validators.required]);
          this.truckAddForm.get('caseExpDate').updateValueAndValidity();
          break;
        case 'Insurance':
          this.isExpiryAvailable = true;
          this.InsuranceFileUrls.push(file.file);
          this.truckAddForm.patchValue({
            insuranceFiles: this.InsuranceFileUrls,
            insuranceExpDate: file.registrationExpireDate,
          });
          this.truckAddForm
            .get('insuranceExpDate')
            .setValidators([Validators.required]);
          this.truckAddForm.get('insuranceExpDate').updateValueAndValidity();
          break;
        case 'Other':
          this.isExpiryAvailable = false;
          this.truckAddForm.patchValue({
            others: file.file,
          });
          break;
      }
    });
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
        this.singleChecklist[item.id] = 'NA';
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

  onClickAddList() {
    localStorage.removeItem('truck');
    this.dialog
      .open(PreHireChecklistComponent, {
        width: '40%',
        data: {
          save: true,
        },
      })
      .afterClosed()
      .subscribe(res => {
        this.countPassCheckList = 0;
        this.singleChecklist = res;
        this.truckAddForm.patchValue({
          checklist: res,
        });
        for (const key in res) {
          if (res[key] === 'PASS') {
            this.countPassCheckList += 1;
          }
        }
      });
  }

  onDateChange($event: Event) {}

  protected readonly truckFileType: TruckFileType[] = truckFileType;
}
