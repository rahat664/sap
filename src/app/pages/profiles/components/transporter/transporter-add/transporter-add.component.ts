import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UserModel } from '../../../../user-management/models/user.model';
import { bkashPaymentMethod, paymentMethod } from '../models/payment-method';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { NgClass, NgIf } from '@angular/common';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { AlphabetOnlyDirective } from '../../../../../shared/directive/alphabet-only.directive';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';

@Component({
  selector: 'app-transporter-add',
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    ReactiveFormsModule,
    NgIf,
    MatDialogModule,
    MatFormField,
    MatInput,
    NgxMaterialIntlTelInputComponent,
    NgClass,
  ],
  templateUrl: './transporter-add.component.html',
  styleUrl: './transporter-add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransporterAddComponent implements OnInit {
  transporterForm: FormGroup;
  transporterModel: UserModel = new UserModel();
  paymentOpened: boolean;
  paymentOptionsArray: CustomInputSelectModel[] = paymentMethod;
  paymentInputPlaceholder: string;
  @Output() formCreated = new EventEmitter<boolean>();
  bkashPaymentTypePlaceholder: string;
  readonly dialogRef = inject(MatDialogRef<TransporterAddComponent>);

  constructor(
    private service: UserService,
    private validation: ValidationService,
    private toastr: HandleToastrService,
    private fb: FormBuilder,
    private shared: DriverEditSharedService
  ) {
    this.transporterForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      phone: ['', [Validators.required]],
      truckStand: ['', Validators.required],
      preferredPaymentMethod: ['', Validators.required],
      bkashName: [null],
      bkashNumber: [null],
      bkashType: [null],
      bankName: [null],
      bankBranch: [null],
      bankAccountName: [null],
      bankAccountNumber: [null],
      role: [''],
      note: [''],
    });
  }

  onSave() {
    if (this.transporterForm.valid) {
      this.transporterModel.name = this.transporterForm.get('name').value;
      this.transporterModel.phone = this.transporterForm.get('phone').value;
      // remove space and - from phone number
      this.transporterModel.phone = this.transporterModel.phone.replace(
        /[\s-]/g,
        ''
      );
      this.transporterModel.note = this.transporterForm.get('note').value;
      this.transporterModel.role = 'ROLE_TRANSPORTER';
      this.transporterModel.truckStand =
        this.transporterForm.get('truckStand').value;
      this.transporterModel.defaultPaymentMethod = this.transporterForm.get(
        'preferredPaymentMethod'
      ).value;
      switch (this.paymentInputPlaceholder) {
        case 'Bkash':
          this.transporterModel.accHolderName =
            this.transporterForm.get('bkashName').value;
          this.transporterModel.bankAccNo =
            this.transporterForm.get('bkashNumber').value;
          this.transporterModel.accType =
            this.transporterForm.get('bkashType').value;
          this.transporterModel.bankName = 'Bkash';
          this.transporterModel.branchName = null;
          this.transporterForm.patchValue({
            bankBranch: null,
            bankAccountName: null,
            bankAccountNumber: null,
          });
          break;
        case 'Bank':
          this.transporterModel.accHolderName =
            this.transporterForm.get('bankAccountName').value;
          this.transporterModel.bankAccNo =
            this.transporterForm.get('bankAccountNumber').value;
          this.transporterModel.accType = null;
          this.transporterModel.bankName =
            this.transporterForm.get('bankName').value;
          this.transporterModel.branchName =
            this.transporterForm.get('bankBranch').value;
          this.transporterForm.patchValue({
            bkashName: null,
            bkashNumber: null,
            bkashType: null,
          });
          break;
        default:
          this.transporterModel.accHolderName = null;
          this.transporterModel.bankAccNo = null;
          this.transporterModel.accType = null;
          this.transporterModel.bankName = 'Cash';
          this.transporterModel.branchName = null;
          this.transporterForm.patchValue({
            bankBranch: null,
            bankAccountName: null,
            bankAccountNumber: null,
            bkashName: null,
            bkashNumber: null,
            bkashType: null,
          });
          break;
      }
      this.service.addUserFromTransport(this.transporterModel).subscribe(
        (res: any) => {
          if (res.status == 'OK') {
            this.toastr.showSuccess('Transporter created successfully');
            this.transporterForm.reset();
            this.dialogRef.close(true);
          } else {
            this.toastr.showError(res.message);
          }
        },
        error => {
          this.toastr.showError(error.error.message);
          this.formCreated.emit(false);
        }
      );
    } else {
      this.transporterForm.markAllAsTouched();
    }
  }

  ngOnInit(): void {
    this.shared.validateInterNationalPhoneNumber();
  }

  onClickPayment($event: boolean) {
    this.paymentOpened = $event;
  }

  onSelectPayment($event: number) {
    this.shared.closeInputSelect.next(false);
    // this.transporterForm.get('preferredPaymentMethod').setValue($event);
    this.paymentInputPlaceholder = this.paymentOptionsArray.find(
      item => item.id === $event
    ).value;
    this.paymentOpened = false;
    this.paymentOptionsArray.forEach(
      item => (item.selected = item.id === $event)
    );
    this.transporterForm.patchValue({
      preferredPaymentMethod: this.paymentInputPlaceholder,
    });
  }

  protected readonly bkashPaymentMethod = bkashPaymentMethod;
  bkashOpened: boolean;

  onClickBkashType($event: boolean) {
    this.bkashOpened = $event;
  }

  onSelectBkashType($event: number) {
    this.bkashPaymentTypePlaceholder = this.bkashPaymentMethod.find(
      item => item.id === $event
    ).value;
    this.bkashOpened = false;
    this.bkashPaymentMethod.forEach(
      item => (item.selected = item.id === $event)
    );
    this.transporterForm.patchValue({
      bkashType: this.bkashPaymentTypePlaceholder,
    });
  }

  getErrorMessage() {
    return this.validation.getErrorMessage(this.transporterForm);
  }

  getNameErrorMessage() {
    if (this.transporterForm.get('name').hasError('required')) {
      return 'Name required';
    } else if (this.transporterForm.get('name').hasError('minlength')) {
      return 'Invalid name';
    } else if (this.transporterForm.get('name').hasError('maxlength')) {
      return 'Invalid name';
    } else {
      return '';
    }
  }

  getPhoneErrorMessageWithTouch() {
    return this.validation.getErrorMessageWithTouch(this.transporterForm);
  }

  onClickClose() {
    this.dialogRef.close(false);
  }

  protected readonly CountryISO = CountryISO;

  get phoneNumber() {
    return this.transporterForm.get('phone');
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
}
