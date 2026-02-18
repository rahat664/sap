import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
  MatSuffix,
} from '@angular/material/input';
import { NgClass, NgIf } from '@angular/common';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { AlphabetOnlyDirective } from '../../../../shared/directive/alphabet-only.directive';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { DriverEditSharedService } from '../../../profiles/services/driver-edit-shared.service';
import { WorkshopHistoryCreateDto } from '../../../profiles/components/truck/models/workshop-history.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { hasPhoneCountryMismatch } from '../../../../shared/utils/phone-validation';

@Component({
  selector: 'app-new-workshop-popup',
  imports: [
    ReactiveFormsModule,
    MatInput,
    NgIf,
    MatFormField,
    NgxMaterialIntlTelInputComponent,
    NgClass,
    AlphabetOnlyDirective,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './new-workshop-popup.component.html',
  styleUrl: './new-workshop-popup.component.scss',
})
export class NewWorkshopPopupComponent {
  protected readonly close = close;
  workshopForm: FormGroup;
  protected readonly CountryISO = CountryISO;
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
  documentFile: File | null = null;
  docPreviewUrl: string | null = null;
  isSubmitting: boolean;
  isEditMode = false;
  private record?: WorkshopHistoryCreateDto;

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private shared: DriverEditSharedService,
    public dialogRef: MatDialogRef<NewWorkshopPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: { record?: WorkshopHistoryCreateDto },
    private toaster: HandleToastrService
  ) {
    this.workshopForm = this.fb.group({
      vehicleId: ['', [Validators.required]],
      vendorName: ['', [Validators.required]],
      vendorPhone: ['', [Validators.required]],
      vendorAddress: ['', [Validators.required]],
      entryDate: ['', [Validators.required]],
      maintenanceDescription: ['', [Validators.required]],
      price: ['', [Validators.required]],
      note: [''],
      document: [null],
      status: ['PENDING_APPROVAL', [Validators.required]],
    });
  }

  ngOnInit() {
    this.shared.validateInterNationalPhoneNumber();
    this.workshopForm
      .get('vehicleId')
      ?.setValue(localStorage.getItem('vehicleId') || '');
    if (this.dialogData?.record) {
      this.isEditMode = true;
      this.record = this.dialogData.record;
      this.patchFormForEdit(this.record);
    }
  }

  private patchFormForEdit(record: WorkshopHistoryCreateDto) {
    this.workshopForm.patchValue({
      vehicleId: record.vehicleId,
      vendorName: record.vendorName,
      vendorPhone: record.vendorPhone || '',
      vendorAddress: record.vendorAddress,
      entryDate: record.entryDate ? new Date(record.entryDate) : '',
      maintenanceDescription: record.maintenanceDescription,
      price: record.price,
      note: (record as any).note || '',
      status: record.status,
    });
  }

  private normalizeDateForSubmit(value: Date | string | null | undefined) {
    if (!value) {
      return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    const adjusted = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)
    );
    return adjusted.toISOString();
  }

  get heading(): string {
    return this.isEditMode ? 'Edit Workshop record' : 'New Workshop record';
  }

  get phoneNumber() {
    return this.workshopForm.get('vendorPhone');
  }

  getPhoneErrorMessageWithTouch() {
    const control = this.workshopForm?.get('vendorPhone');
    if (!control) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Vendor number required';
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

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }

  onSubmit() {
    if (this.workshopForm.valid) {
      const formData = new FormData();
      const payload: Record<string, any> = {};
      Object.keys(this.workshopForm.controls).forEach(key => {
        const control = this.workshopForm.get(key);
        if (control) {
          if (key === 'document' && this.documentFile) {
            formData.append('receiptFiles', this.documentFile);
          } else {
            if (key === 'vendorPhone') {
              payload[key] = control.value.replace(/[\s-]/g, '');
            } else {
              payload[key] =
                key === 'entryDate'
                  ? this.normalizeDateForSubmit(control.value)
                  : control.value;
            }
          }
        }
      });
      if (this.isEditMode && this.record?.id) {
        payload['id'] = this.record.id;
      }
      formData.append('payload', JSON.stringify(payload));
      // Submit formData to the server or perform desired actions
      this.isSubmitting = true;
      const request = this.isEditMode
        ? this.service.editWorkshopHistory(formData)
        : this.service.addWorkshopHistory(formData);
      request.subscribe({
        next: res => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
          this.toaster.showSuccess(
            this.isEditMode
              ? 'Workshop history updated successfully'
              : 'Workshop history added successfully'
          );
        },
        error: err => {
          this.isSubmitting = false;
          this.toaster.showError('Error submitting workshop form:', err);
        },
      });
    } else {
      this.isSubmitting = false;
      if (hasPhoneCountryMismatch(this.workshopForm, ['vendorPhone'])) {
        this.toaster.showInfo(
          'Phone number does not match selected country code'
        );
      } else {
        this.toaster.showInfo('Please fill all required fields');
      }
      this.workshopForm.markAllAsTouched();
    }
  }

  getDriverNameError() {
    if (this.workshopForm?.get('vendorName').hasError('required')) {
      return 'Vendor name required';
    } else if (this.workshopForm?.get('vendorName').hasError('minlength')) {
      return 'Invalid vendor name';
    } else if (this.workshopForm?.get('vendorName').hasError('maxlength')) {
      return 'Invalid vendor name';
    } else {
      return '';
    }
  }

  onDocSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    this.documentFile = file;

    // bind to form
    this.workshopForm.get('document')?.setValue(file);

    // create preview/download URL (safe for images/pdf)
    if (this.docPreviewUrl) URL.revokeObjectURL(this.docPreviewUrl);
    this.docPreviewUrl = file ? URL.createObjectURL(file) : null;
  }

  removeDoc(e: MouseEvent) {
    e.stopPropagation();
    if (this.docPreviewUrl) URL.revokeObjectURL(this.docPreviewUrl);
    this.docPreviewUrl = null;
    this.documentFile = null;
    this.workshopForm.get('document')?.reset(null);
  }

  getDocumentError(): string {
    const c = this.workshopForm.get('document');
    // Customize as needed
    if (c?.hasError('required')) return 'Document is required';
    return 'Invalid file';
  }

  closePopup() {
    this.dialogRef.close(false);
  }
}
