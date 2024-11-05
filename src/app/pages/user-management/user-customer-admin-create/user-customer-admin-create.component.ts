import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlphabetOnlyDirective } from '../../../shared/directive/alphabet-only.directive';
import { CustomInputComponent } from '../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../shared/directive/get-click-event.directive';
import { CommonModule, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomInputSelectModel } from '../../../shared/modules/custom-input/custom-input-select.model';
import { ValidationService } from '../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import { CustomerService } from '../../profiles/services/customer.service';
import { CustomerAdminModel } from '../models/customer-admin-model';
import { MatDialogRef } from '@angular/material/dialog';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { DriverEditSharedService } from '../../profiles/services/driver-edit-shared.service';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-user-customer-admin-create',
  standalone: true,
  imports: [
    AlphabetOnlyDirective,
    CustomInputComponent,
    GetClickEventDirective,
    NgIf,
    ReactiveFormsModule,
    CommonModule,
    NgxMaterialIntlTelInputComponent,
    MatFormField,
    MatInput,
    MatCheckbox,
  ],
  templateUrl: './user-customer-admin-create.component.html',
  styleUrl: './user-customer-admin-create.component.scss',
})
export class UserCustomerAdminCreateComponent {
  userForm: FormGroup;
  roleOptionsArray: CustomInputSelectModel[] = [];

  @Input() isOpen = false;

  @Output() formCreated: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  roleInputPlaceholder = '';
  roleOpened = false;
  userModel: CustomerAdminModel = new CustomerAdminModel();
  SendEmails: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserCustomerAdminCreateComponent>,
    private service: CustomerService,
    private validation: ValidationService,
    private fb: FormBuilder,
    private toastr: HandleToastrService,
    private shared: DriverEditSharedService
  ) {
    this.userForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      designation: [''],
      role: ['', [Validators.required]],
    });
  }

  onSave() {
    this.service.searchCustomer(0, 10).subscribe((res: any) => {
      if (this.userForm.valid) {
        this.userModel.name = this.userForm.get('name').value;
        this.userModel.phone = this.userForm.get('phone').value;
        // remove space and - from phone number
        this.userModel.phone = this.userModel.phone.replace(/[\s-]/g, '');
        this.userModel.email = this.userForm.get('email').value;
        this.userModel.sendEmail = this.SendEmails;
        this.userModel.role =
          this.roleInputPlaceholder === 'Admin'
            ? 'ROLE_CUSTOMER_ADMIN'
            : 'ROLE_USER';
        this.service
          .addCustomerUnderCompany(
            res.data.content[0].customerCode,
            this.userModel
          )
          .subscribe((res: any) => {
            this.formCreated.emit(true);
            if (res.status === 'OK') {
              this.userForm.reset();
              this.dialogRef.close(true);
              this.toastr.showSuccess('User created successfully');
            } else {
              this.toastr.showError(res.message);
            }
          });
      } else {
        this.userForm.markAllAsTouched();
      }
    });
  }

  ngOnInit(): void {
    this.shared.validateInterNationalPhoneNumber();
  }

  onClickRole($event: boolean) {
    this.roleOpened = $event;
  }

  onSelectRole($event: number) {
    this.roles.forEach(role => {
      role.selected = role.id === $event;
    });
    this.roleInputPlaceholder = this.roles.find(
      item => item.id === $event
    ).value;
    this.roleOpened = false;
    this.userForm.patchValue({
      role: this.roleInputPlaceholder,
    });
  }

  protected readonly roles = [
    { id: 1, value: 'Admin', selected: false },
    { id: 3, value: 'User', selected: false },
  ];

  getNameErrorMessage() {
    if (this.userForm.get('name').hasError('required')) {
      return 'Name required';
    } else if (this.userForm.get('name').hasError('minlength')) {
      return 'Invalid name';
    } else if (this.userForm.get('name').hasError('maxlength')) {
      return 'Invalid name';
    } else {
      return '';
    }
  }

  getPhoneErrorMessage() {
    return this.validation.getErrorMessage(this.userForm);
  }

  getEmailErrorMessage() {
    if (this.userForm.get('email').hasError('email')) {
      return 'Invalid email address';
    } else if (this.userForm.get('email').hasError('required')) {
      return 'Email required';
    } else {
      return '';
    }
  }

  getPhoneErrorMessageWithTouch() {
    return this.validation.getErrorMessageWithTouch(this.userForm);
  }

  closeModal() {
    this.dialogRef.close(false);
  }

  get phoneNumber() {
    return this.userForm.get('phone');
  }

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

  protected readonly CountryISO = CountryISO;

  SendEmail($any: any) {
    this.SendEmails = !!$any.checked;
  }
}
