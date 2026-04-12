import { isSuccessStatus } from '../../../shared/utils/response-status';
import { Injectable } from '@angular/core';
import { UserModel } from '../../user-management/models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { BehaviorSubject, timer } from 'rxjs';
import { TruckService } from '../components/truck/services/truck.service';
import { HandleToastrService } from '../../../shared/services/handle-toastr/handle-toastr.service';
import {
  TruckDocument,
  TruckModel,
} from '../components/truck/models/truck.model';
import { TruckDocumentType } from '../../../shared/Enums/registration_type';

type TelFormElement = HTMLElement;
type TelInputElement = HTMLInputElement & {
  __telCaretFixAttached?: boolean;
  __telPointerDown?: boolean;
  __telWasAtEnd?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class DriverEditSharedService {
  driverName: string;
  driverPhone: string;
  documents: any[] = [];
  driverUpdateForm: FormGroup;
  truckUpdateForm: FormGroup;
  isUploadPopupOpen: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  completeUpload: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  completeTruckUpload: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  closeInputSelect: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  truckDocuments: TruckDocument[] = [];
  deletedDriverFiles: any[] = [];
  deletedTruckFiles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private router: Router,
    private truck: TruckService,
    private handleToastr: HandleToastrService
  ) {
    this.initForms();
  }

  private initForms() {
    this.driverUpdateForm = this.fb.group({
      driverId: [''],
      driverName: [''],
      driverPhone: [''],
      nidFront: [null],
      nidBack: [null],
      drivingLicenseFront: [null],
      drivingLicenseBack: [null],
      drivingLicenseExpiryDate: [null],
      other: [null],
    });

    this.truckUpdateForm = this.fb.group({
      id: [''],
      registrationZone: [null, Validators.required],
      registrationCategory: [null, Validators.required],
      registrationSerial: [null, Validators.required],
      registrationNum: [null, Validators.required],
      fitnessCertExpDate: [null],
      routePermitExpDate: [null],
      caseExpDate: [null],
      taxExpDate: [null],
      regPaperFile: [null],
      taxFile: [null],
      fitnessCertificateFile: [null],
      routePermitFile: [null],
      casePaperFile: [null],
      others: [null],
      insuranceFiles: [null],
      truckImages: [null],
      insuranceExpDate: [null],
    });
  }

  validateInterNationalPhoneNumber() {
    timer(10).subscribe(() => {
      const telForms = Array.from(document.getElementsByClassName('tel-form'));
      telForms.forEach(form => {
        const formElement = form as TelFormElement;
        const arrow = formElement.getElementsByClassName(
          'mat-mdc-select-arrow'
        )[0] as HTMLElement | undefined;
        if (arrow) {
          arrow.classList.add('pr-1');
          const arrowSvg = arrow.querySelector('svg');
          if (arrowSvg) {
            arrowSvg.setAttribute('fill', '#fff');
          }
        }
        formElement.classList.add('mt-1');
        this.attachTelInputCaretFix(formElement);
      });
    });
  }

  private attachTelInputCaretFix(container: Element) {
    const input = container.querySelector(
      'input[type="tel"]'
    ) as TelInputElement | null;
    if (!input || input.__telCaretFixAttached) {
      return;
    }
    input.__telCaretFixAttached = true;
    const recordCaretState = () => {
      input.__telWasAtEnd = input.selectionStart === input.value.length;
    };
    input.addEventListener('beforeinput', recordCaretState);
    input.addEventListener('keydown', event => {
      if (this.isCaretMoveKey(event)) {
        input.__telWasAtEnd = false;
        return;
      }
      recordCaretState();
    });
    input.addEventListener('mousedown', () => {
      input.__telPointerDown = true;
    });
    input.addEventListener('touchstart', () => {
      input.__telPointerDown = true;
    });
    input.addEventListener('focus', () => {
      if (!input.__telPointerDown) {
        this.scheduleCaretToEnd(input);
      }
      input.__telPointerDown = false;
    });
    input.addEventListener('input', () => {
      const shouldLock =
        input.__telWasAtEnd ?? input.selectionStart === input.value.length;
      input.__telWasAtEnd = false;
      if (shouldLock) {
        this.scheduleCaretToEnd(input);
      }
    });
  }

  private scheduleCaretToEnd(input: HTMLInputElement) {
    setTimeout(() => {
      if (document.activeElement !== input) {
        return;
      }
      const end = input.value.length;
      input.setSelectionRange(end, end);
    }, 10);
  }

  private isCaretMoveKey(event: KeyboardEvent) {
    return (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'Home' ||
      event.key === 'End'
    );
  }

  bindTruckValueWithForm(singleTruck: TruckModel) {
    this.truckUpdateForm.patchValue({
      id: singleTruck.id,
      registrationZone: singleTruck.registrationZone,
      registrationCategory: singleTruck.registrationCategory,
      registrationSerial: singleTruck.registrationSerial,
      registrationNum: singleTruck.registrationNum,
    });
  }

  bindDriverValueWithForm(singleDriver: UserModel) {
    this.driverName = singleDriver.name;
    this.driverPhone = singleDriver.phone;
    this.driverUpdateForm.patchValue({
      driverName: singleDriver.name,
      driverPhone: singleDriver.phone,
      driverId: singleDriver.userId,
    });
  }

  getTruckDocument(singleTruck: TruckModel) {
    this.truckDocuments = this.generateDocumentList(singleTruck, [
      {
        key: 'truckImages',
        showKey: 'preSignedTruckImages',
        name: 'Truck Image',
        expDateKey: null,
      },
      {
        key: 'insuranceFiles',
        showKey: 'preSignedInsuranceFiles',
        name: 'Insurance',
        expDateKey: 'insuranceExpDate',
      },
      {
        key: 'regPaperFile',
        showKey: 'preSignedRegPaperFile',
        name: 'Registration Paper',
        expDateKey: null,
      },
      {
        key: 'fitnessFile',
        showKey: 'preSignedFitnessFile',
        name: 'Fitness',
        expDateKey: 'fitnessCertExpDate',
      },
      {
        key: 'routePermitFile',
        showKey: 'preSignedRoutePermitFile',
        name: 'Route Permit',
        expDateKey: 'routePermitExpDate',
      },
      {
        key: 'taxFile',
        showKey: 'preSignedTaxFile',
        name: 'Tax',
        expDateKey: 'taxExpDate',
      },
      {
        key: 'caseFile',
        showKey: 'preSignedCaseFile',
        name: 'Case',
        expDateKey: 'caseExpDate',
      },
      {
        key: 'otherFile',
        showKey: 'preSignedOtherFile',
        name: 'Other',
        expDateKey: null,
      },
    ]);
    return this.truckDocuments;
  }

  getDocument(singleDriver: UserModel) {
    this.documents = this.generateDocumentList(
      singleDriver,
      [
        {
          key: 'drivingLicenseFront',
          showKey: 'preSignedDrivingLicenseFront',
          name: 'Driving License Front',
          expDateKey: 'drivingLicenseExpiryDate',
        },
        {
          key: 'drivingLicenseBack',
          name: 'Driving License Back',
          showKey: 'preSignedDrivingLicenseBack',
          expDateKey: 'drivingLicenseExpiryDate',
        },
        {
          key: 'nidFront',
          showKey: 'preSignedNidFront',
          name: 'NID Front',
          expDateKey: null,
        },
        {
          key: 'nidBack',
          showKey: 'preSignedNidBack',
          name: 'NID Back',
          expDateKey: null,
        },
        {
          key: 'other',
          showKey: 'preSignedOther',
          name: 'Other',
          expDateKey: null,
        },
      ],
      'driverFilesUrls'
    );
    return this.documents;
  }

  private generateDocumentList(entity: any, mappings: any[], fileUrlsKey = '') {
    const documents = [];
    const fileUrls = entity;
    mappings.forEach(mapping => {
      if (fileUrls[mapping.key]) {
        documents.push({
          name: mapping.name,
          url: fileUrls[mapping.key],
          showUrl: fileUrls[mapping.showKey],
          expDate: mapping.expDateKey ? entity[mapping.expDateKey] : null,
          expAvailable: !!mapping.expDateKey,
        });
      }
    });
    return documents;
  }

  deleteTruckFile(document: any) {
    const length = this.deletedTruckFiles.length;
    for (let i = 0; i < length; i++) {
      if (i == length - 1) {
        this.truck
          .deleteTruckFiles(
            document[i].preview,
            this.truckUpdateForm.get('id').value
          )
          .subscribe({
            next: (res: any) => {
              if (isSuccessStatus(res?.status)) {
                this.deletedTruckFiles = [];
                this.submitUpdateForm(
                  this.truckUpdateForm,
                  this.truck.editTruck.bind(this.truck),
                  '/profile/vehicle',
                  this.completeTruckUpload
                );
              }
            },
          });
      } else {
        this.truck
          .deleteTruckFiles(
            document[i].preview,
            this.truckUpdateForm.get('id').value
          )
          .subscribe();
      }
    }
  }

  onTruckUpdate() {
    if (this.truckUpdateForm.valid) {
      if (this.deletedTruckFiles.length) {
        this.deleteTruckFile(this.deletedTruckFiles);
      } else {
        this.deletedDriverFiles = [];
        this.submitUpdateForm(
          this.truckUpdateForm,
          this.truck.editTruck.bind(this.truck),
          '/profile/vehicle',
          this.completeTruckUpload
        );
      }
    }
  }

  deleteDriverFile(document: any) {
    const length = this.deletedDriverFiles.length;
    for (let i = 0; i < length; i++) {
      if (i == length - 1) {
        this.service
          .deleteDriverFiles(
            document[i].preview,
            JSON.parse(localStorage.getItem('driver')).id
          )
          .subscribe({
            next: (res: any) => {
              if (isSuccessStatus(res?.status)) {
                this.deletedDriverFiles = [];
                this.submitUpdateForm(
                  this.driverUpdateForm,
                  this.service.editDriver.bind(this.service),
                  '/profile/driver',
                  this.completeUpload
                );
              }
            },
          });
      } else {
        this.service
          .deleteDriverFiles(
            document[i].preview,
            this.driverUpdateForm.get('driverId').value
          )
          .subscribe();
      }
    }
  }

  onDriverUpdate(driverName: string, driverPhone: string) {
    this.driverUpdateForm.patchValue({
      driverName: driverName,
      driverPhone: driverPhone,
    });
    if (this.driverUpdateForm.valid) {
      if (this.deletedDriverFiles.length) {
        this.deleteDriverFile(this.deletedDriverFiles);
      } else {
        this.deletedDriverFiles = [];
        this.submitUpdateForm(
          this.driverUpdateForm,
          this.service.editDriver.bind(this.service),
          '/profile/driver',
          this.completeUpload
        );
      }
    }
  }

  private submitUpdateForm(
    form: FormGroup,
    serviceMethod: Function,
    navigatePath: string,
    completeSubject: BehaviorSubject<any>
  ) {
    const formData = new FormData();
    const payload: Record<string, any> = {};

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      const value = control.value;

      const files = [
        'drivingLicenseFront',
        'drivingLicenseBack',
        'nidFront',
        'nidBack',
        'other',
        'truckImages',
        'insuranceFiles',
      ];

      if (key.endsWith('File') || key === 'others' || files.includes(key)) {
        formData.append(key, value);
      } else {
        payload[key] = value;
      }
    });
    formData.append('payload', JSON.stringify(payload));

    serviceMethod(formData).subscribe(
      (res: any) => {
        if (isSuccessStatus(res?.status)) {
          this.handleToastr.showSuccess(res.message, 'Success');
          this.isUploadPopupOpen.next(false);
          completeSubject.next(true);
          localStorage.removeItem('driver');
          localStorage.removeItem('truck');
          this.truckUpdateForm.reset();
          this.driverUpdateForm.reset();
          this.router.navigate([navigatePath]);
        } else {
          this.handleToastr.showError(res.message, 'Error');
          this.isUploadPopupOpen.next(false);
          completeSubject.next(true);
        }
      },
      error => {
        this.handleToastr.showError(error.error.message, 'Error');
        this.isUploadPopupOpen.next(false);
        completeSubject.next(true);
      }
    );
  }

  onClickTruckCloseButton(document: TruckDocument) {
    this.handleDocumentClose(
      document,
      this.truckUpdateForm,
      this.truckDocuments,
      'truckFilesUrls'
    );
  }

  onClickCloseButton(document: any) {
    this.handleDocumentClose(
      document,
      this.driverUpdateForm,
      this.documents,
      'driverFilesUrls'
    );
  }

  private handleDocumentClose(
    document: any,
    form: FormGroup,
    documents: any[],
    name
  ) {
    const documentKeyMap = {
      'Registration Paper': 'regPaperFile',
      Fitness: 'fitnessCertificateFile',
      'Route Permit': 'routePermitFile',
      Tax: 'taxFile',
      Case: 'casePaperFile',
      Other: name === 'driverFilesUrls' ? 'other' : 'otherFile',
      'Driving License Front': 'drivingLicenseFront',
      'Driving License Back': 'drivingLicenseBack',
      'NID Front': 'nidFront',
      'NID Back': 'nidBack',
    };
    documents = documents.filter(
      (doc: any) => doc.name !== this.getDocumentName(document.documentType)
    );
    if (name === 'driverFilesUrls') {
      this.documents = documents;
      this.deletedDriverFiles.push({
        registrationType: document.name,
        preview: document.url,
      });
    } else {
      this.truckDocuments = documents;
      this.deletedTruckFiles.push({
        registrationType: this.getDocumentName(document.documentType),
        preview: document.fileUrl,
      });
    }
    const formControlName = documentKeyMap[document.name];
    const resetValue = formControlName?.includes('ExpDate') ? null : undefined;
    if (formControlName) {
      form.patchValue({ [formControlName]: resetValue });
    }
  }

  onChangeFile($event: any) {
    this.handleFileChange(
      $event,
      this.driverUpdateForm,
      this.documents,
      'driverFilesUrls'
    );
  }

  onChangeTruckFile($event: any) {
    this.handleFileChange(
      $event,
      this.truckUpdateForm,
      this.truckDocuments,
      'truckFilesUrls'
    );
  }

  private handleFileChange(
    files: any[],
    form: FormGroup,
    documents: any[],
    name
  ) {
    if (files?.length) {
      files.forEach(file => {
        if (name === 'driverFilesUrls') {
          this.deletedDriverFiles = this.deletedDriverFiles.filter(
            (deletedFile: any) => deletedFile !== file.registrationType
          );
        } else {
          this.deletedTruckFiles = this.deletedTruckFiles.filter(
            (deletedFile: any) => deletedFile.registrationType !== file.name
          );
        }
        documents.push({
          name: file.registrationType,
          url: file.preview,
          expDate: file.registrationExpireDate,
        });

        form.patchValue({
          [this.getFileControlName(file.registrationType, name)]: file.file,
          ...(file.registrationExpireDate && {
            [this.getExpDateControlName(file.registrationType)]:
              file.registrationExpireDate,
          }),
        });
      });
      this.isUploadPopupOpen.next(false);
    }
  }

  private getFileControlName(registrationType: string, name) {
    const controlNameMap = {
      'Driving License Front': 'drivingLicenseFront',
      'Driving License Back': 'drivingLicenseBack',
      'NID Front': 'nidFront',
      'NID Back': 'nidBack',
      Other: name === 'driverFilesUrls' ? 'other' : 'others',
      'Registration Paper': 'regPaperFile',
      Fitness: 'fitnessCertificateFile',
      'Route Permit': 'routePermitFile',
      Tax: 'taxFile',
      Case: 'casePaperFile',
      Insurance: 'insuranceFiles',
      'Truck Image': 'truckImages',
    };
    return controlNameMap[registrationType];
  }

  private getExpDateControlName(registrationType: string) {
    const expDateControlNameMap = {
      'Driving License Front': 'drivingLicenseExpiryDate',
      Fitness: 'fitnessCertExpDate',
      'Route Permit': 'routePermitExpDate',
      Tax: 'taxExpDate',
      Case: 'caseExpDate',
      Insurance: 'insuranceExpDate',
    };
    return expDateControlNameMap[registrationType];
  }

  private getDocumentName(documentType: string) {
    if (
      documentType ==
      TruckDocumentType[TruckDocumentType.FITNESS_CERTIFICATE_FILE]
    ) {
      return 'Fitness';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.REG_PAPER_FILE]
    ) {
      return 'Registration Paper';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.ROUTE_PERMIT_FILE]
    ) {
      return 'Route Permit';
    } else if (documentType == TruckDocumentType[TruckDocumentType.TAX_FILE]) {
      return 'Tax';
    } else if (documentType == TruckDocumentType[TruckDocumentType.CASE_FILE]) {
      return 'Case';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.INSURANCE_FILE]
    ) {
      return 'Insurance';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.TRUCK_IMAGE]
    ) {
      return 'Truck Image';
    } else if (
      documentType == TruckDocumentType[TruckDocumentType.OTHER_FILE]
    ) {
      return 'Other';
    } else {
      return 'Other';
    }
  }
}
