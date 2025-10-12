import { Component } from '@angular/core';
import { AlphabetOnlyDirective } from '../../../../shared/directive/alphabet-only.directive';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { DriverEditSharedService } from '../../../profiles/services/driver-edit-shared.service';
import { MatDialogRef } from '@angular/material/dialog';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { FuelRecordPopupComponent } from '../fuel-record-popup/fuel-record-popup.component';

@Component({
  selector: 'app-expense-record-popup',
  imports: [
    AlphabetOnlyDirective,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
  ],
  templateUrl: './expense-record-popup.component.html',
  styleUrl: './expense-record-popup.component.scss',
})
export class ExpenseRecordPopupComponent {
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
    mainLabel: 'Mobile number',
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
  expenseTypeList: any;

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private shared: DriverEditSharedService,
    public dialogRef: MatDialogRef<FuelRecordPopupComponent>,
    private toaster: HandleToastrService
  ) {
    this.fuelForm = this.fb.group({
      vehicleId: ['', [Validators.required]],
      expenseTypeId: ['', [Validators.required]],
      description: ['', [Validators.required]],
      expenseDate: ['', [Validators.required]],
      totalCost: ['', [Validators.required]],
      note: [''],
      document: [null]
    });
  }

  ngOnInit() {
    this.shared.validateInterNationalPhoneNumber();
    this.getExpenseTypes();
    this.fuelForm
      .get('vehicleId')
      ?.setValue(localStorage.getItem('vehicleId') || '');
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
            payload[key] = control.value;
          }
        }
      });
      formData.append('payload', JSON.stringify(payload));
      // Submit formData to the server or perform desired actions
      this.isSubmitting = true;
      this.service.addFuelRecord(formData).subscribe({
        next: res => {
          this.isSubmitting = false;
          this.toaster.showSuccess('Success', 'Fuel record added successfully');
          this.dialogRef.close(true);
        },
        error: err => {
          this.isSubmitting = false;
          this.dialogRef.close(false);
          this.toaster.showError('Error', err?.error?.message || 'Something went wrong');
        },
      });
    } else {
      this.toaster.showError('Error', 'Fuel record not found');
      this.fuelForm.markAllAsTouched();
    }
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

  closePopup() {
    this.dialogRef.close(false);
  }

  private getExpenseTypes() {
    this.service.getExpenseTypes().subscribe({
      next: res => {
        this.expenseTypeList = res?.data || [];
      },
      error: err => {
        this.toaster.showError('Error', err?.error?.message || 'Something went wrong');
      },
    })
  }
}
