import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FallbackImagePipe } from '../../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../../shared/directive/image-error.directive';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Transporter,
  TransporterDocument,
} from '../models/transporter-details.model';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { transporterFileTypeModel } from '../../truck/models/transporter-file-type';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { TransporterDocumentType } from '../../../../../shared/Enums/registration_type';
import { CountryISO, NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import { MatCheckbox } from '@angular/material/checkbox';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { bkashPaymentMethod } from '../models/payment-method';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { ProfileDocumentsComponent } from '../../profile-documents/profile-documents.component';

@Component({
  selector: 'app-transporter-details',
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormField,
    NgClass,
    MatInput,
    NgxMaterialIntlTelInputComponent,
    MatCheckbox,
    CustomInputComponent,
    GetClickEventDirective,
    ProfileDocumentsComponent,
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

  constructor(
    private service: UserService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: HandleToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
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

  onClickSave() {}

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
    });
  }



  protected readonly CountryISO = CountryISO;
  get phoneNumber() {
    return this.transporterUpdateForm.get('phone');
  }

  setPreferredPaymentMethod($any: any, paymentMethod: string) {
    if ($any.checked) {
      this.transporterUpdateForm.get('paymentMethod').setValue(paymentMethod);
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
    if (this.transporter?.defaultPaymentMethod?.paymentMethod !== 'Cash' && this.transporter?.defaultPaymentMethod?.paymentMethod !=='Bank') {
      this.transporterUpdateForm.patchValue({
        mfsName: this.transporter.defaultPaymentMethod?.name,
        mfsNumber: this.transporter.defaultPaymentMethod?.bankAccNo,
        mfsType: this.transporter.defaultPaymentMethod?.paymentMethod,
      });
    }
  }
}
