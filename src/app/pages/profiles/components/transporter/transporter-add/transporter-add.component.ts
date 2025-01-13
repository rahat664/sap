import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
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
import { UserModel } from '../../../../user-management/models/user.model';
import { bkashPaymentMethod, paymentMethod } from '../models/payment-method';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ValidationService } from '../../../../../shared/services/validation/validation.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import { transporterFileTypeModel } from '../../truck/models/transporter-file-type';
import { UploadButtonComponent } from '../../../../../shared/modules/upload-button/upload-button.component';
import { ImageGalleryComponent } from '../../../../../shared/modules/image-gallery/image-gallery.component';
import { ImageGalleryService } from '../../../../../shared/services/image-gallery/image-gallery.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transporter-add',
  standalone: true,
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
    NgForOf,
    UploadButtonComponent,
  ],
  templateUrl: './transporter-add.component.html',
  styleUrl: './transporter-add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransporterAddComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  transporterForm: FormGroup;
  transporterModel: UserModel = new UserModel();
  paymentOpened: boolean;
  paymentOptionsArray: CustomInputSelectModel[] = paymentMethod;
  paymentInputPlaceholder: string;
  @Output() formCreated = new EventEmitter<boolean>();
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  bkashPaymentTypePlaceholder: string;
  selectedFormControlName: string;
  maxUploadAble: number;
  nidFrontImages = [];
  nidBackImages = [];

  constructor(
    private service: UserService,
    private validation: ValidationService,
    private toastr: HandleToastrService,
    private fb: FormBuilder,
    private shared: DriverEditSharedService,
    private imageGalleryService: ImageGalleryService,
    private router: Router
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
      nidFront: [null],
      nidBack: [null],
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
      this.transporterModel.paymentMethod = this.transporterForm.get(
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

      const formData = new FormData();
      this.nidFrontImages.forEach((file: any) => {
        formData.append('nidFront', file.file);
      });
      this.nidBackImages.forEach((file: any) => {
        formData.append('nidBack', file.file);
      });
      formData.append('requestBody', JSON.stringify(this.transporterModel));
      this.service.addUserFromTransport(formData).subscribe(
        (res: any) => {
          if (res.status == 'OK') {
            this.toastr.showSuccess('Transporter created successfully');
            this.transporterForm.reset();
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
    const navigation = history.state;
    if (!navigation.backFromGallery) {
      this.getStateData();
    }
    this.restoreFromLocalStorage();
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
  protected readonly transporterFileType = transporterFileTypeModel;
  everyThingDisabled: boolean;

  getSpecificFiles(formControlName: string | undefined) {
    switch (formControlName) {
      case 'nidFront':
        if (this.nidFrontImages.length > 3) {
          return this.nidFrontImages.slice(0, 3);
        } else {
          return this.nidFrontImages;
        }
      case 'nidBack':
        if (this.nidBackImages.length > 3) {
          return this.nidBackImages.slice(0, 3);
        } else {
          return this.nidBackImages;
        }
      default:
        return [];
    }
  }

  onClickPdfDocument(file: any) {
    this.imageGalleryService.setCurrentImage(file);
    this.dialog.open(ImageGalleryComponent, {
      minHeight: '90vh',
      minWidth: '90%',
      // center the position
      data: {
        images: file.preview,
      },
    });
  }

  onCloseImage(formControlName: string | undefined, file: any) {
    let files: any[] = [];
    switch (formControlName) {
      case 'nidFront':
        this.nidFrontImages = this.nidFrontImages.filter(
          item => item.preview !== file.preview
        );
        files = this.nidFrontImages;
        break;
      case 'nidBack':
        this.nidBackImages = this.nidBackImages.filter(
          item => item.preview !== file.preview
        );
        files = this.nidBackImages;
        break;
    }
    const formControlFiles = [];
    files.forEach((file: any) => {
      formControlFiles.push(file.file);
    });
    this.transporterForm.patchValue({
      [formControlName]: formControlFiles,
    });
  }

  getFileArray(formControlName: string | undefined) {
    switch (formControlName) {
      case 'nidFront':
        return this.nidFrontImages;
      case 'nidBack':
        return this.nidBackImages;
      default:
        return [];
    }
  }

  triggerFileUpload(formControlName: string | undefined, max: number) {
    this.selectedFormControlName = formControlName;
    this.maxUploadAble = max;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (this.transporterForm.get(this.selectedFormControlName)?.value) {
      const currentFiles = Array.from(
        this.transporterForm.get(this.selectedFormControlName)?.value
      );
      if (currentFiles.length + files.length > this.maxUploadAble) {
        this.toastr.showError(
          `You can upload maximum of ${this.maxUploadAble} files`
        );
        return;
      } else {
        this.router.navigate([`/profile/transporter/image-upload`], {
          state: {
            addedTripDocument: files,
            imageType: [{ value: '1', viewValue: 'Unloading Challan' }],
            expiryAvailable: false,
            noteAvailable: false,
            type: 'Unloading',
            returnUrl: `/profile/transporter/add`,
          },
        });
      }
    } else {
      if (files.length > this.maxUploadAble) {
        this.toastr.showError(
          `You can upload maximum of ${this.maxUploadAble} files`
        );
        return;
      } else {
        this.router.navigate([`/profile/transporter/image-upload`], {
          state: {
            addedTransporterDocument: files,
            imageType: [
              {
                value: '1',
                viewValue:
                  this.selectedFormControlName == 'nidFront'
                    ? 'NID Front'
                    : 'NID Back',
              },
            ],
            expiryAvailable: false,
            noteAvailable: false,
            type:
              this.selectedFormControlName == 'nidFront'
                ? 'NID Front'
                : 'NID Back',
            returnUrl: `/profile/transporter/add`,
          },
        });
      }
    }
  }

  private getStateData() {
    const navigation = history.state;
    if (navigation) {
      const addedTransporterDocument = navigation.addedTransporterDocument;
      const imageType = navigation.imageType;
      if (imageType) {
        if (imageType[0].viewValue === 'NID Front') {
          this.nidFrontImages = addedTransporterDocument;
          localStorage.setItem(
            'nidFront',
            JSON.stringify(addedTransporterDocument)
          );
        }
        if (imageType[0].viewValue === 'NID Back') {
          this.nidBackImages = addedTransporterDocument;
          localStorage.setItem(
            'nidBack',
            JSON.stringify(addedTransporterDocument)
          );
        }
      }
    }
  }

  onClickImageDocument(
    transporterDocument,
    document,
    formControlName: string | undefined
  ) {
    this.selectedFormControlName = formControlName;
    const files = [];
    if (transporterDocument) {
      transporterDocument?.forEach((file: any) => {
        files.push(file.preview);
      });
    }
    this.router.navigate(['image-details'], {
      state: {
        tripDocuments: files,
        imageType:
          this.selectedFormControlName === 'nidFront'
            ? 'NID Front'
            : 'NID Back',
        expiryAvailable: false,
        noteAvailable: false,
        activatedDocument: document.preview,
        returnUrl: `/profile/transporter/add`,
      },
    });
  }

  private clearNavigationInformation() {
    this.nidFrontImages = [];
    this.nidBackImages = [];
  }

  private restoreFromLocalStorage() {
    const nidFront = localStorage.getItem('nidFront');
    const nidBack = localStorage.getItem('nidBack');
    if (nidFront) {
      this.nidFrontImages = JSON.parse(nidFront);
      localStorage.removeItem('nidFront');
    }
    if (nidBack) {
      this.nidBackImages = JSON.parse(nidBack);
      localStorage.removeItem('nidBack');
    }
  }
}
