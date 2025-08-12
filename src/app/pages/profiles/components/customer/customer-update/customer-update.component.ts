import { Component, EventEmitter, Output } from '@angular/core';
import { AlphabetOnlyDirective } from '../../../../../shared/directive/alphabet-only.directive';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { NgClass, NgIf } from '@angular/common';
import { NgxMaterialIntlTelInputComponent, CountryISO } from 'ngx-material-intl-tel-input';
import { MatFormField } from '@angular/material/form-field';
import { CustomerCreateModel, UpdateCustomerModel } from '../model/customer-create.model';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { MatDialogRef } from '@angular/material/dialog';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { tripTypes } from '../../../../auth/models/response/trip';

@Component({
  selector: 'app-customer-update',
  imports: [
    AlphabetOnlyDirective,
    FormsModule,
    MatFormField,
    MatInput,
    MatRadioButton,
    MatRadioGroup,
    NgIf,
    NgxMaterialIntlTelInputComponent,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './customer-update.component.html',
  styleUrl: './customer-update.component.scss',
})
export class CustomerUpdateComponent {
  customerForm: FormGroup;
  customerModel = new UpdateCustomerModel();
  private subs: Subscription;
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
    public dialogRef: MatDialogRef<CustomerUpdateComponent>,
    private shared: DriverEditSharedService
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      code: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
      ],
      email: [null, [Validators.email]],
      phone: [''],
      contactPerson: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      address: [null],
      note: [null],
      tripType: [''],
      preferredPaymentType: [''],
    });
  }

  ngOnInit(): void {
    this.shared.validateInterNationalPhoneNumber();
    this.getCustomerDetailsAndSetForm();
  }

  onSave() {
    if (this.customerForm.valid) {
      this.customerModel.id = localStorage.getItem('selectedCustomerId') || '';
      this.customerModel.name = this.customerForm.get('name').value;
      // this.customerModel.contactPerson =
      //   this.customerForm.get('contactPerson').value;
      this.customerModel.phone = this.customerForm.get('phone').value;
      // remove space and - from phone number
      this.customerModel.phone = this.customerModel.phone.replace(/[\s-]/g, '');
      this.customerModel.email = this.customerForm.get('email').value;
      this.customerModel.address = this.customerForm.get('address').value;
      this.customerModel.note = this.customerForm.get('note').value;
      this.customerModel.tripType = this.customerForm.get('tripType').value;
      this.customerModel.preferredPaymentType = this.customerForm.get(
        'preferredPaymentType'
      ).value;
      if (this.checkIfAnyInputChanged()) {
        this.submitCustomer();
      } else {
        this.toastr.showWarning('No changes made to the customer details');
        this.dialogRef.close();
      }
    } else {
      this.customerForm.markAllAsTouched();
    }
  }

  private submitCustomer() {
    this.service.editCustomer(this.customerModel).subscribe(
      (res: any) => {
        if (res) {
          this.toastr.showSuccess('Customer updated successfully');
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

  private getCustomerDetailsAndSetForm() {
    const customerData = JSON.parse(
      localStorage.getItem('customerData') || '{}'
    );
    const contactPersonData = JSON.parse(
      localStorage.getItem('contactPersonData') || '{}'
    );

    if (customerData && Object.keys(customerData).length > 0) {
      this.customerForm.patchValue({
        name: customerData.name,
        code: customerData.customerCode,
        email: customerData.email,
        phone: contactPersonData.phone || '',
        contactPerson: contactPersonData.contactPersonName || '',
        address: customerData.address,
        note: customerData.note,
        tripType: customerData.tripType || '',
        preferredPaymentType: customerData.preferredPaymentType || '',
      });
      this.customerTripType = customerData.tripType || '';
      this.customerPaymentType = customerData.preferredPaymentType || '';
    }
  }

  private checkIfAnyInputChanged() {
    const currentValues = this.customerModel
    const originalValues = JSON.parse(
      localStorage.getItem('customerData') || '{}'
    );

    // Compare each field to see if any value has changed
    return (
      currentValues.name !== originalValues.name ||
      currentValues.email !== originalValues.email ||
      currentValues.phone !== originalValues.phone ||
      currentValues.address !== originalValues.address ||
      currentValues.note !== originalValues.note ||
      currentValues.tripType !== originalValues.tripType ||
      currentValues.preferredPaymentType !==
        originalValues.preferredPaymentType
    );
  }
}
