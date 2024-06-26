import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {CustomerCreateModel} from "../model/customer-create.model";
import {UserService} from "../../../services/user.service";
import {ToastrService} from "ngx-toastr";
import {Subscription} from "rxjs";
import {CustomerService} from "../../../services/customer.service";
import {ConvertToFormdataService} from "../../../../../shared/services/convert-to-formdata/convert-to-formdata.service";
import {ValidationService} from "../../../../../shared/services/validation/validation.service";

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.scss'
})
export class CustomerCreateComponent implements OnInit, OnDestroy {
  customerForm: FormGroup;
  customerModel = new CustomerCreateModel()
  private subs: Subscription;
  @Output() formCreated: EventEmitter<boolean> = new EventEmitter<boolean>(false)

  constructor(
    private fb: FormBuilder,
    private service: CustomerService,
    private toastr: ToastrService,
    private validation: ValidationService
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      email: [null, [Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(11), Validators.maxLength(11)]],
      contactPerson: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      address: [null],
      note: [null]
    });
  }

  ngOnInit(): void {
    this.customerForm.get('code').valueChanges.subscribe((value) => {
      //only allow 4 characters
      if (value.length > 4) {
        this.customerForm.get('code').setValue(value.substring(0, 4))
      }
      if (value.length == 4) {
        this.checkCustomerCodeIsAlreadyExistOrNot(value)
      }
    })
    this.subs = this.customerForm.get('name').valueChanges.subscribe((value) => {
      if (value.length > 0 && this.customerForm.get('code').invalid) {
        let fourDigitName = ""
        const valueWithoutSpace = value?.toString().replace(/\s/g, '')
        if (valueWithoutSpace.length >= 4) {
          fourDigitName = valueWithoutSpace?.toString().substring(0, 4).toUpperCase()
          this.customerForm.get('code').setValue(fourDigitName)
          this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName)
        }
      }
    })
    this.customerForm.get('phone').valueChanges.subscribe((value) => {
      this.validation.mobileNumberValidation(value, this.customerForm)
    })
  }

  onSave() {
    if (this.customerForm.valid) {
      this.customerModel.name = this.customerForm.get('name').value;
      this.customerModel.customerCode = this.customerForm.get('code').value;
      this.customerModel.contactPerson = this.customerForm.get('contactPerson').value;
      this.customerModel.phone = this.customerForm.get('phone').value;
      this.customerModel.email = this.customerForm.get('email').value;
      this.customerModel.address = this.customerForm.get('address').value;
      this.customerModel.note = this.customerForm.get('note').value;
      this.customerModel.role = 'Customer';
      this.service.customerCodeValidation(this.customerModel.customerCode).subscribe((res: any) => {
        if (res.data.validation == 'Failed') {
          this.subs.unsubscribe();
          this.customerForm.get('code').setValue(res.data.Suggestion)
          this.customerModel.customerCode = res.data.Suggestion
          this.submitCustomer()
        } else {
          this.submitCustomer()
        }
      })
    } else {
      this.customerForm.markAllAsTouched();
    }
  }

  private submitCustomer() {
    this.service.addCustomer(this.customerModel).subscribe((res: any) => {
        if (res.status == 'OK') {
          this.toastr.success(res.message)
          this.customerForm.reset()
          this.formCreated.emit(true);
        } else {
          this.toastr.error(res.error.message)
          this.formCreated.emit(true);
        }
      },
      (error: any) => {
        this.toastr.error(error.error.message)
      }
    )
  }

  ngOnDestroy(): void {
    this.customerForm.reset()
  }

  getErrorMessage() {
    return this.validation.getErrorMessage(this.customerForm)
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
    return this.validation.getErrorMessageWithTouch(this.customerForm)
  }

  getCustomerCodeError() {
    if (this.customerForm?.get('code').hasError('required')) {
      return 'Customer code required';
    } else if (this.customerForm?.get('code').hasError('minlength')) {
      return 'Invalid customer code';
    } else {
      return '';
    }
  }

  private checkCustomerCodeIsAlreadyExistOrNot(fourDigitName: string) {
    this.service.customerCodeValidation(fourDigitName).subscribe((res: any) => {
      if (res.data.validation == 'Failed') {
        this.customerForm.get('code').setValue(res.data.Suggestion)
        this.customerModel.customerCode = res.data.Suggestion
      } else {
        this.customerModel.customerCode = fourDigitName
      }
    })
  }

  protected readonly onfocus = onfocus;

  onfocusOut($event: FocusEvent) {
    if ($event && this.customerForm.get('name').value.length > 0 && this.customerForm.get('code').invalid) {
      let fourDigitName = ""
      const valueWithoutSpace = this.customerForm.get('name').value?.toString().replace(/\s/g, '')
      if (valueWithoutSpace.length < 4) {
        // fill the missing characters with random numbers
        const randomNumbers = Math.floor(Math.random() * 10000).toString()
        fourDigitName = valueWithoutSpace + randomNumbers.substring(0, 4 - valueWithoutSpace.length).toUpperCase()
        this.customerForm.get('code').setValue(fourDigitName)
        this.checkCustomerCodeIsAlreadyExistOrNot(fourDigitName)
      }
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
}
