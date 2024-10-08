import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../profiles/services/user.service';
import { CustomInputSelectModel } from '../../../shared/modules/custom-input/custom-input-select.model';
import { CustomInputComponent } from '../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../shared/directive/get-click-event.directive';
import { UserModel } from '../models/user.model';
import { roles } from '../models/role-file';
import { ValidationService } from '../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import { AlphabetOnlyDirective } from '../../../shared/directive/alphabet-only.directive';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { DriverEditSharedService } from '../../profiles/services/driver-edit-shared.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    CustomInputComponent,
    GetClickEventDirective,
    AlphabetOnlyDirective,
    MatFormField,
    MatInput,
    NgClass,
    NgxMaterialIntlTelInputComponent,
  ],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  roleOptionsArray: CustomInputSelectModel[] = [];

  @Input() isOpen = false;

  @Output() formCreated: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  roleInputPlaceholder = '';
  roleOpened = false;
  userModel: UserModel = new UserModel();

  constructor(
    public dialogRef: MatDialogRef<UserCreateComponent>,
    private service: UserService,
    private validation: ValidationService,
    private fb: FormBuilder,
    private toastr: HandleToastrService,
    private sharedService: DriverEditSharedService
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
    if (this.userForm.valid) {
      this.userModel.name = this.userForm.get('name').value;
      this.userModel.mobile = this.userForm.get('phone').value;
      // remove space and - from phone number
      this.userModel.mobile = this.userModel.mobile.replace(/[\s-]/g, '');
      this.userModel.email = this.userForm.get('email').value;
      this.userModel.role = 'ROLE_ADMIN';
      this.userModel.department = this.userForm.get('role').value;
      this.userModel.designation = this.userForm.get('designation').value;
      this.service.addUser(this.userModel).subscribe((res: any) => {
        if (res.status === 'OK') {
          this.dialogRef.close(true);
          this.userForm.reset();
          this.toastr.showSuccess('User created successfully');
        } else {
          this.toastr.showError(res.message);
        }
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  ngOnInit(): void {
    this.sharedService.validateInterNationalPhoneNumber();
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

  protected readonly roles = roles;

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
    this.userForm.reset();
  }

  protected readonly CountryISO = CountryISO;

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
    invalidNumberError: 'Number is not valid',
    requiredError: 'This field is required',
  };
}
