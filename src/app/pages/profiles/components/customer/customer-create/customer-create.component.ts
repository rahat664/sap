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

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    AlphabetOnlyDirective,
    MatFormField,
    MatInput,
    NgxMaterialIntlTelInputComponent,
    NgClass,
    MatCheckbox,
  ],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.scss',
})
export class CustomerCreateComponent implements OnInit, OnDestroy {
  customerForm: FormGroup;
  customerModel = new CustomerCreateModel();
  private subs: Subscription;
  @Output() formCreated: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  sendEmail: boolean = false;

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
    });
  }

  ngOnInit(): void {
    this.shared.validateInterNationalPhoneNumber();
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
      this.customerModel.email = this.customerForm.get('email').value;
      this.customerModel.address = this.customerForm.get('address').value;
      this.customerModel.note = this.customerForm.get('note').value;
      this.customerModel.sendEmail = this.sendEmail;
      this.service
        .customerCodeValidation(this.customerModel.customerCode)
        .subscribe((res: any) => {
          if (res.data.validation == 'Failed') {
            this.subs.unsubscribe();
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
    this.service.addCustomer(this.customerModel).subscribe(
      (res: any) => {
        if (res.status == 'OK') {
          this.toastr.showSuccess('Customer created successfully');
          this.customerForm.reset();
          this.dialogRef.close(true);
        } else {
          this.toastr.showError(res.error.message);
        }
      },
      (error: any) => {
        this.toastr.showError(error.error.message);
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
    if (this.customerForm?.get('email').hasError('email')) {
      return 'Invalid email address';
    } else if (this.customerForm?.get('email').hasError('required')) {
      return 'Email address required';
    } else {
      return '';
    }
  }

  getPhoneErrorMessageWithTouch() {
    return this.validation.getErrorMessageWithTouch(this.customerForm);
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

  private checkCustomerCodeIsAlreadyExistOrNot(fourDigitName: string) {
    if (fourDigitName.length === 4) {
      this.service
        .customerCodeValidation(fourDigitName)
        .subscribe((res: any) => {
          if (res.data.validation == 'Failed') {
            this.customerForm.get('code').setErrors({
              invalidCustomerCode: true,
              message: `Code already exists. Use  '${res.data.Suggestion}' instead`,
            });
            this.customerForm.get('code').markAsTouched();
          } else {
            this.customerModel.customerCode = fourDigitName;
          }
        });
    }
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
    const value = $event.target['value'];
    const valueWithoutSpace = value?.toString().replace(/\s/g, '');
    if (value?.length > 0) {
      let fourDigitName = '';
      if (valueWithoutSpace?.length > 0 && valueWithoutSpace?.length <= 4) {
        fourDigitName = valueWithoutSpace
          ?.toString()
          .substring(0, 4)
          .toUpperCase();
        this.customerForm.get('code').setValue(fourDigitName);
        this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName);
      } else {
        fourDigitName = valueWithoutSpace
          ?.toString()
          .substring(0, 4)
          .toUpperCase();
        this.customerForm.get('code').setValue(fourDigitName);
        this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName);
      }
      if (valueWithoutSpace?.length < 4) {
        // fill the missing characters with random numbers
        const randomNumbers = Math.floor(Math.random() * 10000).toString();
        fourDigitName =
          valueWithoutSpace +
          randomNumbers
            .substring(0, 4 - valueWithoutSpace?.length)
            .toUpperCase();
        this.customerForm.get('code').setValue(fourDigitName.toUpperCase());
        this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName);
      }
    } else {
      this.customerForm.get('code').setValue('');
    }
  }

  onCodeKeyPress($event: Event) {
    const value = $event.target['value'];
    const valueWithoutSpace = value?.toString().replace(/\s/g, '');
    if (value?.length > 0) {
      let fourDigitName = '';
      if (valueWithoutSpace?.length > 0 && valueWithoutSpace?.length <= 4) {
        fourDigitName = valueWithoutSpace
          ?.toString()
          .substring(0, 4)
          .toUpperCase();
        this.customerForm.get('code').setValue(fourDigitName);
        this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName);
      }
    } else {
      this.customerForm.get('code').setValue('');
    }
  }

  protected readonly CountryISO = CountryISO;

  textLabels = {
    mainLabel: 'Mobile number',
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: '',
    requiredError: 'This field is required',
  };

  get phoneNumber() {
    return this.customerForm.get('phone');
  }

  toggleSendEmail($any: any) {
    this.sendEmail = !!$any.checked;
  }
}
