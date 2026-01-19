import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
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
import { bkashPaymentMethod, paymentMethod } from '../models/payment-method';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { MatCheckbox } from '@angular/material/checkbox';
import { ProfileDocumentsComponent } from '../../profile-documents/profile-documents.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { transporterFileTypeModel } from '../../truck/models/transporter-file-type';
import {
  Transporter,
  TransporterDocument,
} from '../models/transporter-details.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatOption } from '@angular/material/core';
import { PaymentType } from '../../../../../shared/Enums/payment-type';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { MatRadioButton } from '@angular/material/radio';
import { isSuccessStatus } from '../../../../../shared/utils/response-status';
import { hasPhoneCountryMismatch } from '../../../../../shared/utils/phone-validation';

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
    ProfileDocumentsComponent,
    MatRadioButton,
  ],
  templateUrl: './transporter-add.component.html',
  styleUrl: './transporter-add.component.scss',
})
export class TransporterAddComponent implements OnInit {
  nidFront: any[] = [];
  nidBack: any[] = [];
  profilePicture: any[] = [];
  tradeLicense: any[] = [];
  agreement: any[] = [];
  other: any[] = [];
  readonly dialog = inject(MatDialog);
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  transporterFileType = transporterFileTypeModel;
  protected readonly bkashPaymentMethod = bkashPaymentMethod;
  bkashPaymentTypePlaceholder: string;
  transporterId: any;
  transporter: Transporter;
  isInEditMode: boolean;
  loading: boolean;
  transporterAddForm: FormGroup;
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
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  transporterDocuments: TransporterDocument[] = [];
  preferredPaymentMethod: string = '';
  tradeLicenseExpiration: string;
  agreementExpiration: any;
  mfsTypePlaceholder: string;

  constructor(
    private service: UserService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: HandleToastrService,
    private router: Router,
    private shared: DriverEditSharedService
  ) {}

  ngOnInit() {
    this.shared.validateInterNationalPhoneNumber();
    this.initializeForm();
    const isFromDocumentSave = localStorage.getItem('isFromDocumentSave');
    if (isFromDocumentSave) {
      this.loadPreviousPayload();
    }
    // get transporter id from param
    this.transporterAddForm.get('name').valueChanges.subscribe(value => {
      this.transporterAddForm.get('contactPersonName').setValue(value);
    });
  }

  onClickSave() {
    this.transporterAddForm.markAllAsTouched();
    if (this.transporterAddForm.invalid) {
      if (hasPhoneCountryMismatch(this.transporterAddForm, ['phone'])) {
        this.toastr.showError(
          'Phone number does not match selected country code'
        );
      } else {
        this.toastr.showError('Please fill all required fields');
      }
      return;
    }
    this.loading = true;
    let payload = {
      name: this.transporterAddForm.get('name').value,
      contactPersonNumber: this.transporterAddForm.get('phone').value,
      truckStand: this.transporterAddForm.get('truckStand').value,
      defaultPaymentMethod: {
        name: this.transporterAddForm.get('bankName').value,
        branchName: this.transporterAddForm.get('bankBranch').value,
        accHolderName: this.transporterAddForm.get('bankAccountName').value,
        bankAccNo: this.transporterAddForm.get('bankAccountNumber').value,
        paymentMethod: this.transporterAddForm.get('paymentMethod').value,
        accType: '',
      },
      contactPersonName: this.transporterAddForm.get('contactPersonName').value,
      note: this.transporterAddForm.get('note').value,
    };

    payload.contactPersonNumber = payload.contactPersonNumber.replace(
      /[\s-]/g,
      ''
    );
    if (payload.defaultPaymentMethod.paymentMethod === 'MFS') {
      payload.defaultPaymentMethod.name =
        this.transporterAddForm.get('mfsName').value;
      payload.defaultPaymentMethod.bankAccNo =
        this.transporterAddForm.get('mfsNumber').value;
      payload.defaultPaymentMethod.accType =
        this.transporterAddForm.get('mfsType').value;
    }

    const payloadFormData = new FormData();

    const files = this.retrieveFilesForUpload();

    if (files.profileFiles.length > 0) {
      files.profileFiles.forEach((file: any) => {
        payloadFormData.append('profilePicture', file);
      });
    }
    if (files.nidFrontFiles.length > 0) {
      files.nidFrontFiles.forEach((file: any) => {
        payloadFormData.append('nidFront', file);
      });
    }
    if (files.nidBackFiles.length > 0) {
      files.nidBackFiles.forEach((file: any) => {
        payloadFormData.append('nidBack', file);
      });
    }
    if (files.tradeLicenseFiles.length > 0) {
      this.tradeLicenseExpiration =
        this.getExpiryFromSessionStorage('Trade License');
      files.tradeLicenseFiles.forEach((file: any) => {
        payloadFormData.append('tradeLicense', file);
      });
    }
    if (files.agreementFiles.length > 0) {
      this.agreementExpiration = this.getExpiryFromSessionStorage('Agreement');
      // create a property in payload for agreement expiration
      files.agreementFiles.forEach((file: any) => {
        payloadFormData.append('agreement', file);
      });
    }
    if (files.otherFiles.length > 0) {
      files.otherFiles.forEach((file: any) => {
        payloadFormData.append('other', file);
      });
    }

    if (this.agreementExpiration) {
      payload['agreementExpiration'] = this.agreementExpiration;
    }

    if (this.tradeLicenseExpiration) {
      payload['tradeLicenseExpiration'] = this.tradeLicenseExpiration;
    }

    payloadFormData.append('payload', JSON.stringify(payload));

    this.service.addTransporter(payloadFormData).subscribe(
      (response: any) => {
        if (response && isSuccessStatus(response.status)) {
          this.toastr.showSuccess(response.message);
          this.router.navigate(['/profile/transporter']);
        } else {
          this.toastr.showError(response.message);
        }
      },
      error => {
        this.loading = false;
        this.toastr.showError(error.error.message);
      }
    );
  }

  retrieveFilesForUpload() {
    // Retrieve all file data from localStorage
    const profileFiles = localStorage.getItem('Transporter Image');
    const nidFrontFiles = localStorage.getItem('NID Front');
    const nidBackFiles = localStorage.getItem('NID Back');
    const tradeLicenseFiles = localStorage.getItem('Trade License');
    const agreementFiles = localStorage.getItem('Agreement');
    const otherFiles = localStorage.getItem('Other');

    // Function to reconstruct files from stored base64
    const reconstructFiles = (storedFiles: string | null) => {
      if (!storedFiles) return [];

      const parsedFiles = JSON.parse(storedFiles);
      return parsedFiles.map((fileData: any) => {
        // Convert base64 to Blob
        const byteCharacters = atob(fileData.base64.split(',')[1]); // Remove "data:<type>;base64,"
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const fileBlob = new Blob([byteArray], { type: fileData.type });

        // Create a File object
        return new File([fileBlob], fileData.name, { type: fileData.type });
      });
    };

    // Reconstruct all file categories
    return {
      profileFiles: reconstructFiles(profileFiles),
      nidFrontFiles: reconstructFiles(nidFrontFiles),
      nidBackFiles: reconstructFiles(nidBackFiles),
      tradeLicenseFiles: reconstructFiles(tradeLicenseFiles),
      agreementFiles: reconstructFiles(agreementFiles),
      otherFiles: reconstructFiles(otherFiles),
    };
  }

  onClickCancel() {
    this.isInEditMode = false;
  }

  onClickApprove(driverDetails: any) {}

  onClickReject(driverDetails: any) {}

  onClickEdit() {
    this.isInEditMode = true;
    this.bindTransporterData();
  }

  private initializeForm() {
    this.transporterAddForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      truckStand: ['', Validators.required],
      bankName: [''],
      bankBranch: [''],
      bankAccountName: [''],
      bankAccountNumber: [''],
      mfsName: [''],
      mfsNumber: [''],
      mfsType: [''],
      paymentMethod: ['', Validators.required],
      contactPersonName: ['', Validators.required],
      role: [''],
      note: [''],
      nidFront: [''],
      nidBack: [''],
      profilePicture: [''],
      tradeLicense: [''],
      agreement: [''],
      other: [''],
      agreementExpiration: [''],
      tradeLicenseExpiration: [''],
    });
  }

  protected readonly CountryISO = CountryISO;
  mfsService: CustomInputSelectModel[] = [
    { id: 1, value: 'bKash', selected: false },
    { id: 2, value: 'Nagad', selected: false },
  ];

  get phoneNumber() {
    return this.transporterAddForm.get('phone');
  }

  getPhoneErrorMessageWithTouch() {
    const control = this.transporterAddForm?.get('phone');
    if (!control) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Phone number is required';
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

  setPreferredPaymentMethod($any: any, paymentMethod: string) {
    if ($any.source.checked) {
      this.preferredPaymentMethod = paymentMethod;
      this.transporterAddForm.get('paymentMethod').setValue(paymentMethod);
    } else {
      this.preferredPaymentMethod = '';
      this.transporterAddForm.get('paymentMethod').setValue('');
    }
  }

  onSelectBkashType($event: number) {
    this.bkashPaymentTypePlaceholder = this.bkashPaymentMethod.find(
      method => method.id === $event
    ).value;
    this.bkashPaymentMethod.forEach(
      method => (method.selected = method.id === $event)
    );
    this.transporterAddForm
      .get('mfsType')
      .setValue(this.bkashPaymentTypePlaceholder);
  }

  private bindTransporterData() {
    this.transporterAddForm.patchValue({
      name: this.transporter.name,
      phone: this.transporter.contactPersonNumber,
      truckStand: this.transporter.truckStand,
      bankName: this.transporter?.defaultPaymentMethod?.name,
      bankBranch: this.transporter?.defaultPaymentMethod?.branchName,
      bankAccountName: this.transporter?.defaultPaymentMethod?.accHolderName,
      bankAccountNumber: this.transporter?.defaultPaymentMethod?.bankAccNo,
      paymentMethod: this.transporter.defaultPaymentMethod?.paymentMethod,
      contactPersonName: this.transporter.contactPersonName,
      note: this.transporter.note,
    });
    if (
      this.transporter?.defaultPaymentMethod?.paymentMethod !== 'Cash' &&
      this.transporter?.defaultPaymentMethod?.paymentMethod !== 'Bank'
    ) {
      this.transporterAddForm.patchValue({
        mfsName: this.transporter.defaultPaymentMethod?.name,
        mfsNumber: this.transporter.defaultPaymentMethod?.bankAccNo,
        mfsType: this.transporter.defaultPaymentMethod?.paymentMethod,
      });
    }
  }

  private loadPreviousPayload() {
    const payload = JSON.parse(localStorage.getItem('transporterPayload'));
    this.preferredPaymentMethod = payload.defaultPaymentMethod?.paymentMethod;
    this.transporterAddForm.patchValue({
      name: payload.name,
      phone: payload.contactPersonNumber,
      truckStand: payload.truckStand,
      bankName: payload.defaultPaymentMethod?.name,
      bankBranch: payload.defaultPaymentMethod?.branchName,
      bankAccountName: payload.defaultPaymentMethod?.accHolderName,
      bankAccountNumber: payload.defaultPaymentMethod?.bankAccNo,
      paymentMethod: payload.defaultPaymentMethod?.paymentMethod,
      contactPersonName: payload.contactPersonName,
      note: payload.note,
    });
    if (
      this.preferredPaymentMethod === 'MFS'
    ) {
      this.transporterAddForm.patchValue({
        mfsName: payload.defaultPaymentMethod?.name,
        accType: payload.defaultPaymentMethod?.accType,
        mfsNumber: payload.defaultPaymentMethod?.bankAccNo,
        mfsType: payload.defaultPaymentMethod?.paymentMethod,
      });

      this.bkashPaymentMethod.forEach(method => {
        method.selected =
          method.value === payload.defaultPaymentMethod?.accType;
      })
      this.bkashPaymentTypePlaceholder = payload.defaultPaymentMethod?.accType;
      this.mfsService.forEach((method) => {
        method.selected =
          method.value === payload.defaultPaymentMethod?.name;
      })
      this.mfsTypePlaceholder = payload.defaultPaymentMethod?.name;
    }
  }

  onUploadButtonTriggered($event: any) {
    if ($event) {
      const payload = {
        name: this.transporterAddForm.get('name').value,
        contactPersonNumber: this.transporterAddForm.get('phone').value,
        truckStand: this.transporterAddForm.get('truckStand').value,
        defaultPaymentMethod: {
          name: this.transporterAddForm.get('bankName').value,
          branchName: this.transporterAddForm.get('bankBranch').value,
          accHolderName: this.transporterAddForm.get('bankAccountName').value,
          bankAccNo: this.transporterAddForm.get('bankAccountNumber').value,
          paymentMethod: this.transporterAddForm.get('paymentMethod').value,
          accType: '',
        },
        contactPersonName:
          this.transporterAddForm.get('contactPersonName').value,
        note: this.transporterAddForm.get('note').value,
      };
      if (this.preferredPaymentMethod === 'MFS') {
        payload.defaultPaymentMethod.name =
          this.transporterAddForm.get('mfsName').value;
        payload.defaultPaymentMethod.bankAccNo =
          this.transporterAddForm.get('mfsNumber').value;
        payload.defaultPaymentMethod.accType =
          this.transporterAddForm.get('mfsType').value;
      }

      localStorage.setItem('isFromDocumentSave', String(true));

      localStorage.setItem('transporterPayload', JSON.stringify(payload));
    }
  }

  private getExpiryFromSessionStorage(name: string) {
    switch (name) {
      case 'Trade License':
        return localStorage.getItem('tradelicenseexpiry');
      case 'Agreement':
        return localStorage.getItem('agreementexpiry');
      default:
        return null;
    }
  }

  onSelectMFSType($event: number) {
    this.mfsTypePlaceholder = this.mfsService.find(
      method => method.id === $event
    ).value;
    this.mfsService.forEach(method => (method.selected = method.id === $event));
    this.transporterAddForm
      .get('mfsName')
      .setValue(this.mfsTypePlaceholder);
  }

  protected readonly paymentMethod = paymentMethod;
}
