import { isSuccessStatus } from '../../../../../shared/utils/response-status';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { CustomerCreateModel } from '../model/customer-create.model';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { AlphabetOnlyDirective } from '../../../../../shared/directive/alphabet-only.directive';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MatCheckbox } from '@angular/material/checkbox';
import {MatRadioButton, MatRadioChange, MatRadioGroup} from '@angular/material/radio';
import { tripTypes } from '../../../../auth/models/response/trip';

@Component({
  selector: 'app-customer-create',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AlphabetOnlyDirective,
    MatFormField,
    MatInput,
    NgxMaterialIntlTelInputComponent,
    NgClass,
    MatCheckbox,
    MatRadioButton,
    MatRadioGroup,
  ],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.scss',
})
export class CustomerCreateComponent implements OnInit, OnDestroy {
  customerForm: FormGroup;
  customerModel = new CustomerCreateModel();
  private subs: Subscription;
  private isCodeManuallyEdited = false;
  private lastRequestedCustomerCode = '';
  private lastValidatedCustomerCode = '';
  @Output() formCreated: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  sendEmail = false;
  customerCodeLoading: boolean;
   customerPaymentType: any;

  constructor(
    private fb: FormBuilder,
    private service: CustomerService,
    private toastr: HandleToastrService,
    private validation: ValidationService,
    public dialogRef: MatDialogRef<CustomerCreateComponent>,
    private shared: DriverEditSharedService
  ) {
    this.customerForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      code: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
      ],
      email: [null, [Validators.email]],
      phone: ['', [Validators.required]],
      contactPerson: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      address: [null],
      note: [null],
      tripType: ['', [Validators.required]],
      preferredPaymentType: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.shared.validateInterNationalPhoneNumber();
    this.customerForm.get('email')?.valueChanges.subscribe(() => {
      this.clearEmailExistsError();
    });
  }

  onSave() {
    if (this.customerForm.valid) {
      this.customerModel.name = this.customerForm.get('name').value;
      this.customerModel.customerCode = this.customerForm.get('code').value;
      this.customerModel.contactPerson =
        this.customerForm.get('contactPerson').value;
      this.customerModel.phone = this.customerForm.get('phone').value;
      // remove space and - from phone number
      this.customerModel.phone = this.customerModel.phone.replace(/[\s-]/g, '');
      this.customerModel.email = this.normalizeEmail(
        this.customerForm.get('email').value
      );
      this.customerModel.address = this.customerForm.get('address').value;
      this.customerModel.note = this.customerForm.get('note').value;
      this.customerModel.tripType = this.customerForm.get('tripType').value;
      this.customerModel.preferredPaymentType = this.customerForm.get('preferredPaymentType').value;
      this.customerModel.sendEmail = this.sendEmail;
      this.service
        .customerCodeValidation(this.customerModel.customerCode)
        .subscribe((res: any) => {
          if (res.data.validation == 'Failed') {
            this.subs?.unsubscribe();
            this.customerForm.get('code').setValue(res.data.Suggestion);
            this.customerModel.customerCode = res.data.Suggestion;
            this.submitCustomer();
          } else {
            this.submitCustomer();
          }
        });
    } else {
      this.customerForm.markAllAsTouched();
    }
  }

  private submitCustomer() {
    const payload: CustomerCreateModel & { email?: string | null } = {
      ...this.customerModel,
    };
    if (!payload.email) {
      delete payload.email;
    }
    this.service.addCustomer(payload).subscribe(
      (res: any) => {
        if (isSuccessStatus(res?.status)) {
          this.toastr.showSuccess('Customer created successfully');
          this.customerForm.reset();
          this.dialogRef.close(true);
        } else {
          const message =
            this.getCustomerErrorMessage(res) ?? 'Failed to create customer';
          this.setEmailExistsErrorIfNeeded(message);
          this.toastr.showError(message);
        }
      },
      (error: any) => {
        const message =
          this.getCustomerErrorMessage(error) ?? 'Failed to create customer';
        this.setEmailExistsErrorIfNeeded(message);
        this.toastr.showError(message);
      }
    );
  }

  ngOnDestroy(): void {
    this.customerForm.reset();
  }

  getErrorMessage() {
    return this.validation.getErrorMessage(this.customerForm);
  }

  getEmailErrorMessage() {
    const emailControl = this.customerForm?.get('email');
    if (emailControl?.hasError('emailExists')) {
      return emailControl.getError('message') || 'Email already exists';
    } else if (emailControl?.hasError('email')) {
      return 'Invalid email address';
    } else if (emailControl?.hasError('required')) {
      return 'Email address required';
    } else {
      return '';
    }
  }

  getPhoneErrorMessageWithTouch() {
    const control = this.customerForm?.get('phone');
    if (!control) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Phone number required';
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

  getCustomerCodeError() {
    if (this.customerForm?.get('code').hasError('required')) {
      return 'Customer code required';
    } else if (this.customerForm?.get('code').hasError('minlength')) {
      return 'Invalid customer code';
    } else if (this.customerForm?.get('code').hasError('invalidCustomerCode')) {
      return this.customerForm?.get('code').getError('message');
    } else {
      return '';
    }
  }

  private getCustomerErrorMessage(error: any): string | null {
    if (!error) {
      return null;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error.message === 'string') {
      return error.message;
    }
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (typeof error.statusText === 'string') {
      return error.statusText;
    }
    return null;
  }

  private normalizeEmail(email: string | null | undefined): string | null {
    const normalized = (email || '').toString().trim();
    return normalized.length > 0 ? normalized : null;
  }

  private setEmailExistsErrorIfNeeded(message: string | null) {
    if (!message) {
      return;
    }
    const lowerMessage = message.toLowerCase();
    if (!lowerMessage.includes('email')) {
      return;
    }
    if (!lowerMessage.includes('exist') && !lowerMessage.includes('already')) {
      return;
    }
    const emailControl = this.customerForm?.get('email');
    if (!emailControl) {
      return;
    }
    emailControl.setErrors({
      ...(emailControl.errors || {}),
      emailExists: true,
      message,
    });
    emailControl.markAsTouched();
  }

  private clearEmailExistsError() {
    const emailControl = this.customerForm?.get('email');
    if (!emailControl?.hasError('emailExists')) {
      return;
    }
    const errors = { ...(emailControl.errors || {}) };
    delete errors['emailExists'];
    delete errors['message'];
    emailControl.setErrors(Object.keys(errors).length ? errors : null);
  }

  private checkCustomerCodeIsAlreadyExistOrNot(fourDigitName: string) {
    if (fourDigitName.length !== 4) {
      return;
    }
    if (
      fourDigitName === this.lastRequestedCustomerCode ||
      fourDigitName === this.lastValidatedCustomerCode
    ) {
      return;
    }
    this.customerCodeLoading = true;
    this.lastRequestedCustomerCode = fourDigitName;
    this.service.customerCodeValidation(fourDigitName).subscribe(
      (res: any) => {
        this.customerCodeLoading = false;
        this.lastRequestedCustomerCode = '';
        this.lastValidatedCustomerCode = fourDigitName;
        if (res.data.validation == 'Failed') {
          this.customerForm.get('code').setErrors({
            invalidCustomerCode: true,
            message: `Code already exists. Use  '${res.data.Suggestion}' instead`,
          });
          this.customerForm.get('code').markAsTouched();
        } else {
          this.customerModel.customerCode = fourDigitName;
        }
      },
      error => {
        this.customerCodeLoading = false;
        this.lastRequestedCustomerCode = '';
      }
    );
  }

  getContactPersonErrorMessage() {
    if (this.customerForm?.get('contactPerson').hasError('required')) {
      return 'Contact person required';
    } else if (this.customerForm?.get('contactPerson').hasError('minlength')) {
      return 'Invalid contact person';
    } else if (this.customerForm?.get('contactPerson').hasError('maxlength')) {
      return 'Invalid contact person';
    } else {
      return '';
    }
  }

  getCustomerNameErrorMessage() {
    if (this.customerForm?.get('name').hasError('required')) {
      return 'Customer name required';
    } else if (this.customerForm?.get('name').hasError('minlength')) {
      return 'Invalid customer name';
    } else if (this.customerForm?.get('name').hasError('maxlength')) {
      return 'Invalid customer name';
    } else {
      return '';
    }
  }

  onClickClose() {
    this.customerForm.reset();
    this.dialogRef.close(false);
  }

  onNameKeyPress($event: Event) {
    const codeControl = this.customerForm.get('code');
    const currentCode = (codeControl?.value || '').toString();
    if (this.isCodeManuallyEdited && currentCode.length === 4) {
      return;
    }
    const value = $event.target['value'];
    const valueWithoutSpace = value?.toString().replace(/\s/g, '');
    if (!value || valueWithoutSpace?.length === 0) {
      this.customerForm.get('code').setValue('');
      this.customerCodeLoading = false;
      this.lastRequestedCustomerCode = '';
      this.lastValidatedCustomerCode = '';
      return;
    }

    const upperValue = valueWithoutSpace.toString().toUpperCase();
    if (upperValue.length < 4) {
      // fill the missing characters with random numbers
      const randomNumbers = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      const fourDigitName =
        upperValue + randomNumbers.substring(0, 4 - upperValue.length);
      this.customerForm.get('code').setValue(fourDigitName);
      return;
    }

    const fourDigitName = upperValue.substring(0, 4);
    if (fourDigitName === currentCode) {
      return;
    }
    this.customerForm.get('code').setValue(fourDigitName);
    this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName);
  }

  onCodeKeyPress($event: Event) {
    const value = $event.target['value'];
    const valueWithoutSpace = value?.toString().replace(/\s/g, '');
    const codeControl = this.customerForm.get('code');
    this.isCodeManuallyEdited = valueWithoutSpace?.length > 0;
    if (value?.length > 0) {
      let fourDigitName = '';
      if (valueWithoutSpace?.length > 0 && valueWithoutSpace?.length <= 4) {
        if (valueWithoutSpace?.length < 4) {
          this.lastRequestedCustomerCode = '';
          this.lastValidatedCustomerCode = '';
          if (codeControl?.hasError('invalidCustomerCode')) {
            const errors = { ...(codeControl.errors || {}) };
            delete errors['invalidCustomerCode'];
            delete errors['message'];
            codeControl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
        fourDigitName = valueWithoutSpace
          ?.toString()
          .substring(0, 4)
          .toUpperCase();
        codeControl?.setValue(fourDigitName);
        this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName);
      }
    } else {
      this.lastRequestedCustomerCode = '';
      this.lastValidatedCustomerCode = '';
      codeControl?.setValue('');
      if (codeControl?.hasError('invalidCustomerCode')) {
        const errors = { ...(codeControl.errors || {}) };
        delete errors['invalidCustomerCode'];
        delete errors['message'];
        codeControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

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

  get phoneNumber() {
    return this.customerForm.get('phone');
  }

  toggleSendEmail($any: any) {
    this.sendEmail = !!$any.checked;
  }

  onSelectTripType(event: MatRadioChange) {
    const type = event.value;
    this.customerTripType = type;
    this.customerForm.get('tripType')?.setValue(type);
  }

  protected readonly tripTypes = tripTypes;
  customerTripType: string = '';

  onSelectPaymentType(event: MatRadioChange) {
    const type = event.value;
    this.customerPaymentType = type;
    this.customerForm.get('preferredPaymentType')?.setValue(type);
  }
}
