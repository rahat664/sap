import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { bkashPaymentMethod, paymentMethod } from '../models/payment-method';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
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
    MatCheckbox,
    ProfileDocumentsComponent,
    MatOption,
  ],
  templateUrl: './transporter-add.component.html',
  styleUrl: './transporter-add.component.scss',
})
export class TransporterAddComponent implements OnInit {
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
    this.transporterAddForm.get('name').valueChanges.subscribe(value => {
      this.transporterAddForm.get('contactPersonName').setValue(value);
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
    });
  }

  protected readonly CountryISO = CountryISO;

  get phoneNumber() {
    return this.transporterAddForm.get('phone');
  }

  setPreferredPaymentMethod($any: any, paymentMethod: string) {
    if ($any.checked) {
      this.transporterAddForm.get('paymentMethod').setValue(paymentMethod);
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
}
