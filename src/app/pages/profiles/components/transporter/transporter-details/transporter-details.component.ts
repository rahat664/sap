import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Transporter,
  TransporterDocument,
} from '../models/transporter-details.model';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { transporterFileTypeModel } from '../../truck/models/transporter-file-type';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { MatCheckbox } from '@angular/material/checkbox';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { bkashPaymentMethod } from '../models/payment-method';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { ProfileDocumentsComponent } from '../../profile-documents/profile-documents.component';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { MatRadioButton } from '@angular/material/radio';

@Component({
  selector: 'app-transporter-details',
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormField,
    NgClass,
    MatInput,
    NgxMaterialIntlTelInputComponent,
    CustomInputComponent,
    GetClickEventDirective,
    ProfileDocumentsComponent,
    MatRadioButton,
  ],
  templateUrl: './transporter-details.component.html',
  styleUrl: './transporter-details.component.scss',
})
export class TransporterDetailsComponent {
  readonly dialog = inject(MatDialog);
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  transporterFileType = transporterFileTypeModel;
  protected readonly bkashPaymentMethod = bkashPaymentMethod;
  bkashPaymentTypePlaceholder: string;
  mfsTypePlaceholder: string;
  transporterId: any;
  transporter: Transporter;
  isInEditMode: boolean;
  loading: boolean;
  transporterUpdateForm: FormGroup;
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
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  transporterDocuments: TransporterDocument[] = [];
  tradeLicenseExpiration: string;
  agreementExpiration: string;
  preferredPaymentMethod: string;

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
      localStorage.removeItem('isFromDocumentSave');
      this.isInEditMode = true;
      this.loadPreviousPayload();
    }
    // get transporter id from param
    this.route.params.subscribe(params => {
      this.transporterId = params['id'];
      this.getTransporterId();
    });

    this.transporterUpdateForm.get('name').valueChanges.subscribe(value => {
      this.transporterUpdateForm.get('contactPersonName').setValue(value);
    });
  }

  private getTransporterId() {
    this.service
      .getTransporterById(this.transporterId)
      .subscribe((res: any) => {
        this.transporter = res.data;
        this.transporterDocuments = this.transporter?.documentsList;
      });
  }

  onClickUpdate() {
    const formValue = this.transporterUpdateForm.value;
    const body = {
      id: this.transporterId,
      name: formValue.name,
      contactPersonNumber: formValue.phone,
      truckStand: formValue.truckStand,
      defaultPaymentMethod: {
        name: this.transporterUpdateForm.get('bankName').value,
        branchName: this.transporterUpdateForm.get('bankBranch').value,
        accHolderName: this.transporterUpdateForm.get('bankAccountName').value,
        bankAccNo: this.transporterUpdateForm.get('bankAccountNumber').value,
        paymentMethod: this.transporterUpdateForm.get('paymentMethod').value,
        accType: '',
      },
      contactPersonName: formValue.contactPersonName,
      note: formValue.note,
    };
    if (this.preferredPaymentMethod === 'MFS') {
      body.defaultPaymentMethod.name =
        this.transporterUpdateForm.get('mfsName').value;
      body.defaultPaymentMethod.bankAccNo =
        this.transporterUpdateForm.get('mfsNumber').value;
      body.defaultPaymentMethod.accType =
        this.transporterUpdateForm.get('mfsType').value;
    }
    body.contactPersonNumber = body.contactPersonNumber.replace(/[\s-]/g, '');
    const formData = new FormData();
    const files = this.retrieveFilesForUpload();

    if (files.profileFiles.length > 0) {
      files.profileFiles.forEach((file: any) => {
        formData.append('profilePicture', file);
      });
    }
    if (files.nidFrontFiles.length > 0) {
      files.nidFrontFiles.forEach((file: any) => {
        formData.append('nidFront', file);
      });
    }
    if (files.nidBackFiles.length > 0) {
      files.nidBackFiles.forEach((file: any) => {
        formData.append('nidBack', file);
      });
    }
    if (files.tradeLicenseFiles.length > 0) {
      this.tradeLicenseExpiration =
        this.getExpiryFromSessionStorage('Trade License');
      files.tradeLicenseFiles.forEach((file: any) => {
        formData.append('tradeLicense', file);
      });
    }
    if (files.agreementFiles.length > 0) {
      this.agreementExpiration = this.getExpiryFromSessionStorage('Agreement');
      // create a property in payload for agreement expiration
      files.agreementFiles.forEach((file: any) => {
        formData.append('agreement', file);
      });
    }
    if (files.otherFiles.length > 0) {
      files.otherFiles.forEach((file: any) => {
        formData.append('other', file);
      });
    }

    if (this.agreementExpiration) {
      body['agreementExpiration'] = this.agreementExpiration;
    }

    if (this.tradeLicenseExpiration) {
      body['tradeLicenseExpiration'] = this.tradeLicenseExpiration;
    }

    formData.append('payload', JSON.stringify(body));

    this.service.updateTransporter(formData).subscribe(
      (res: any) => {
        if (res.status === 'OK') {
          this.toastr.showSuccess(res.message);
          this.router.navigate(['/profile/transporter']);
          this.isInEditMode = false;
        } else {
          this.toastr.showError(res.message);
        }
      },
      (error: any) => {
        this.toastr.showError(error.error.message);
      }
    );
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
    this.transporterUpdateForm = this.fb.group({
      name: [''],
      phone: [''],
      truckStand: [''],
      bankName: [''],
      bankBranch: [''],
      bankAccountName: [''],
      bankAccountNumber: [''],
      mfsName: [''],
      mfsNumber: [''],
      mfsType: [''],
      paymentMethod: [''],
      contactPersonName: [''],
      role: [''],
      note: [''],
      nidFront: [''],
      nidBack: [''],
      profilePicture: [''],
      tradeLicense: [''],
      agreement: [''],
      other: [''],
      tradeLicenseExpiration: [''],
      agreementExpiration: [''],
    });
  }

  retrieveFilesForUpload() {
    // Retrieve all file data from sessionStorage
    const profileFiles = sessionStorage.getItem('Transporter Image');
    const nidFrontFiles = sessionStorage.getItem('NID Front');
    const nidBackFiles = sessionStorage.getItem('NID Back');
    const tradeLicenseFiles = sessionStorage.getItem('Trade License');
    const agreementFiles = sessionStorage.getItem('Agreement');
    const otherFiles = sessionStorage.getItem('Other');

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

  protected readonly CountryISO = CountryISO;
  mfsService: CustomInputSelectModel[] = [
    {
      id: 1,
      value: 'Bkash',
      selected: false,
    },
    {
      id: 2,
      value: 'Nagad',
      selected: false,
    },
  ];

  get phoneNumber() {
    return this.transporterUpdateForm.get('phone');
  }

  setPreferredPaymentMethod($any: any, paymentMethod: string) {
    if ($any.source.checked) {
      this.preferredPaymentMethod = paymentMethod;
      this.transporterUpdateForm.get('paymentMethod').setValue(paymentMethod);
    } else {
      this.preferredPaymentMethod = '';
      this.transporterUpdateForm.get('paymentMethod').setValue('');
    }
  }

  onSelectBkashType($event: number) {
    this.bkashPaymentTypePlaceholder = this.bkashPaymentMethod.find(
      method => method.id === $event
    ).value;
    this.bkashPaymentMethod.forEach(
      method => (method.selected = method.id === $event)
    );
    this.transporterUpdateForm
      .get('mfsType')
      .setValue(this.bkashPaymentTypePlaceholder);
  }

  private bindTransporterData() {
    this.transporterUpdateForm.patchValue({
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
      this.transporterUpdateForm.patchValue({
        mfsName: this.transporter.defaultPaymentMethod?.name,
        mfsNumber: this.transporter.defaultPaymentMethod?.bankAccNo,
        mfsType: this.transporter.defaultPaymentMethod?.accType,
      });
      this.mfsService.forEach((method: any) => {
        method.selected =
          method.value === this.transporter.defaultPaymentMethod?.name;
      })
      this.mfsTypePlaceholder = this.transporter.defaultPaymentMethod?.name;
      this.bkashPaymentMethod.forEach(method => {
        method.selected =
          method.value === this.transporter.defaultPaymentMethod?.accType;
      })

      this.bkashPaymentTypePlaceholder = this.transporter.defaultPaymentMethod?.accType;
    }
    this.preferredPaymentMethod =
      this.transporter.defaultPaymentMethod?.paymentMethod;
  }

  private getExpiryFromSessionStorage(name: string) {
    switch (name) {
      case 'Trade License':
        return sessionStorage.getItem('tradelicenseexpiry');
      case 'Agreement':
        return sessionStorage.getItem('agreementexpiry');
      default:
        return null;
    }
  }

  onUploadButtonTriggered($event: any) {
    if ($event) {
      const payload = {
        name: this.transporterUpdateForm.get('name').value,
        contactPersonNumber: this.transporterUpdateForm.get('phone').value,
        truckStand: this.transporterUpdateForm.get('truckStand').value,
        defaultPaymentMethod: {
          name: this.transporterUpdateForm.get('bankName').value,
          branchName: this.transporterUpdateForm.get('bankBranch').value,
          accHolderName:
            this.transporterUpdateForm.get('bankAccountName').value,
          bankAccNo: this.transporterUpdateForm.get('bankAccountNumber').value,
          paymentMethod: this.transporterUpdateForm.get('paymentMethod').value,
          accType: '',
        },
        contactPersonName:
          this.transporterUpdateForm.get('contactPersonName').value,
        note: this.transporterUpdateForm.get('note').value,
      };
      if (this.preferredPaymentMethod === 'MFS') {
        payload.defaultPaymentMethod.name =
          this.transporterUpdateForm.get('mfsName').value;
        payload.defaultPaymentMethod.bankAccNo =
          this.transporterUpdateForm.get('mfsNumber').value;
        payload.defaultPaymentMethod.accType =
          this.transporterUpdateForm.get('mfsType').value;
      }

      localStorage.setItem('isFromDocumentSave', String(true));

      localStorage.setItem('transporterPayload', JSON.stringify(payload));
    }
  }

  private loadPreviousPayload() {
    const payload = JSON.parse(localStorage.getItem('transporterPayload'));
    this.transporterUpdateForm.patchValue({
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
      payload.defaultPaymentMethod?.paymentMethod !== 'Cash' &&
      payload.defaultPaymentMethod?.paymentMethod !== 'Bank'
    ) {
      this.transporterUpdateForm.patchValue({
        mfsName: payload.defaultPaymentMethod?.name,
        mfsNumber: payload.defaultPaymentMethod?.bankAccNo,
        mfsType: payload.defaultPaymentMethod?.paymentMethod,
      });
    }
  }

  onSelectMFSType($event: number) {
    this.mfsTypePlaceholder = this.mfsService.find(
      method => method.id === $event
    ).value;
    this.mfsService.forEach(method => (method.selected = method.id === $event));
    this.transporterUpdateForm
      .get('mfsName')
      .setValue(this.mfsTypePlaceholder);
  }
}
