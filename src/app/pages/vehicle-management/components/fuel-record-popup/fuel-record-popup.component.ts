import { Component, Inject } from '@angular/core';
import { AlphabetOnlyDirective } from '../../../../shared/directive/alphabet-only.directive';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { DriverEditSharedService } from '../../../profiles/services/driver-edit-shared.service';
import { NgClass, NgIf } from '@angular/common';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { RefuelRecord } from '../../../profiles/components/truck/models/fuel.model';

@Component({
  selector: 'app-fuel-record-popup',
  imports: [
    AlphabetOnlyDirective,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    MatFormField,
    MatSuffix,
    MatInput,
    MatOption,
    MatSelect
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './fuel-record-popup.component.html',
  styleUrl: './fuel-record-popup.component.scss',
})
export class FuelRecordPopupComponent {
  fuelTypeList: any[] = [
    { id: 1, value: 'DIESEL' },
    { id: 2, value: 'PETROL' },
    { id: 3, value: 'LPG' },
    { id: 4, value: 'CNG' },
    { id: 5, value: 'OCTANE' },
  ];
  protected readonly close = close;
  fuelForm: FormGroup;
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
  private record?: RefuelRecord;

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private shared: DriverEditSharedService,
    public dialogRef: MatDialogRef<FuelRecordPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: { record?: RefuelRecord },
    private toaster: HandleToastrService
  ) {
    this.fuelForm = this.fb.group({
      vehicleId: ['', [Validators.required]],
      fuelType: ['', [Validators.required]],
      fuelVolumeInLiters: ['', [Validators.required]],
      stationName: ['', [Validators.required]],
      totalCost: ['', [Validators.required]],
      refuelDateTime: ['', [Validators.required]],
      notes: [''],
      document: [null],
      unitPrice: [100.00]
    });
  }

  ngOnInit() {
    this.shared.validateInterNationalPhoneNumber();
    this.fuelForm
      .get('vehicleId')
      ?.setValue(localStorage.getItem('vehicleId') || '');
    if (this.dialogData?.record) {
      this.isEditMode = true;
      this.record = this.dialogData.record;
      this.patchFormForEdit(this.record);
    }
  }

  private patchFormForEdit(record: RefuelRecord) {
    this.fuelForm.patchValue({
      vehicleId: record.vehicleId,
      fuelType: record.fuelType,
      fuelVolumeInLiters: record.fuelVolumeInLiters,
      stationName: record.stationName,
      totalCost: record.totalCost,
      refuelDateTime: record.refuelDateTime
        ? new Date(record.refuelDateTime)
        : '',
      notes: record.notes ?? '',
      unitPrice: record.unitPrice ?? this.fuelForm.get('unitPrice')?.value,
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
  onSubmit() {
    if (this.fuelForm.valid) {
      const formData = new FormData();
      const payload: Record<string, any> = {};
      Object.keys(this.fuelForm.controls).forEach(key => {
        const control = this.fuelForm.get(key);
        if (control) {
          if (key === 'document' && this.documentFile) {
            formData.append('receiptFiles', this.documentFile);
          } else {
            payload[key] =
              key === 'refuelDateTime'
                ? this.normalizeDateForSubmit(control.value)
                : control.value;
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
        ? this.service.editFuelRecord(formData)
        : this.service.addFuelRecord(formData);
      request.subscribe({
        next: res => {
          this.isSubmitting = false;
          this.toaster.showSuccess(
            'Success',
            this.isEditMode
              ? 'Fuel record updated successfully'
              : 'Fuel record added successfully'
          );
          this.dialogRef.close(true);
        },
        error: err => {
          this.isSubmitting = false;
          this.dialogRef.close(false);
          this.toaster.showError(
            'Error',
            err?.error?.message || 'Something went wrong'
          );
        },
      });
    } else {
      this.toaster.showError('Error', 'Fuel record not found');
      this.fuelForm.markAllAsTouched();
    }
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

  onDocSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    this.documentFile = file;

    // bind to form
    this.fuelForm.get('document')?.setValue(file);

    // create preview/download URL (safe for images/pdf)
    if (this.docPreviewUrl) URL.revokeObjectURL(this.docPreviewUrl);
    this.docPreviewUrl = file ? URL.createObjectURL(file) : null;
  }

  removeDoc(e: MouseEvent) {
    e.stopPropagation();
    if (this.docPreviewUrl) URL.revokeObjectURL(this.docPreviewUrl);
    this.docPreviewUrl = null;
    this.documentFile = null;
    this.fuelForm.get('document')?.reset(null);
  }

  getDocumentError(): string {
    const c = this.fuelForm.get('document');
    // Customize as needed
    if (c?.hasError('required')) return 'Document is required';
    return 'Invalid file';
  }

  get heading(): string {
    return this.isEditMode ? 'Edit fuel record' : 'New fuel record';
  }

  closePopup() {
    this.dialogRef.close(false);
  }
}
