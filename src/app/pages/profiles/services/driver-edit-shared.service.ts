import {Injectable, OnInit} from '@angular/core';
import {UserModel} from "../../user-management/models/user.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "./user.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {TruckInnerModel} from "../components/truck/models/truck-inner.model";
import {TruckService} from "../components/truck/services/truck.service";

@Injectable({
  providedIn: 'root'
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
  truckDocuments: any;
  isConfirmModalOpen: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private toastr: ToastrService,
    private router: Router,
    private truck: TruckService
  ) {
    this.driverUpdateForm = this.fb.group({
      driverId: [''],
      driverName: [''],
      driverPhone: [''],
      nidFront: [null],
      nidBack: [null],
      drivingLicenseFront: [null],
      drivingLicenseBack: [null],
      drivingLicenseExpiryDate: [null],
      other: [null]
    });

    this.truckUpdateForm = this.fb.group({
      id: [''],
      registration_zone: [null, Validators.required],
      registration_category: [null, Validators.required],
      registration_serial: [null, Validators.required],
      registration_num: [null, Validators.required],
      fitnessCertExpDate: [null],
      routePermitExpDate: [null],
      caseExpDate: [null],
      taxExpDate: [null],
      regPaperFile: [null],
      taxFile: [null],
      fitnessCertificateFile: [null],
      routePermitFile: [null],
      casePaperFile: [null],
      others: [null]
    });

  }

  bindTruckValueWithForm(singleTruck: TruckInnerModel) {
    this.truckUpdateForm.patchValue({
      id: singleTruck.id,
      registration_zone: singleTruck.registration_zone,
      registration_category: singleTruck.registration_category,
      registration_serial: singleTruck.registration_serial,
      registration_num: singleTruck.registration_num,
      fitnessCertExpDate: singleTruck.fitnessCertExpDate,
      routePermitExpDate: singleTruck.routePermitExpDate,
      caseExpDate: singleTruck.caseExpDate,
      taxExpDate: singleTruck.taxExpDate,
    });
  }

  bindDriverValueWithForm(singleDriver: UserModel) {
    this.driverName = singleDriver.name;
    this.driverPhone = singleDriver.phone;
    this.driverUpdateForm.patchValue({
      driverName: singleDriver.name,
      driverPhone: singleDriver.phone,
      driverId: singleDriver.userId,
      drivingLicenseExpiryDate: singleDriver.drivingLicenseExpiryDate
    });
  }

  getTruckDocument(singleTruck: TruckInnerModel) {
    this.truckDocuments = [];
    if (singleTruck.regPaperFile) {
      this.truckDocuments.push({
        name: 'Registration Paper',
        url: singleTruck.regPaperFile,
        expDate: null
      });
    }
    if (singleTruck.fitnessFile) {
      this.truckDocuments.push({
        name: 'Fitness',
        url: singleTruck.fitnessFile,
        expDate: singleTruck.fitnessCertExpDate
      });
    }
    if (singleTruck.routePermitFile) {
      this.truckDocuments.push({
        name: 'Route Permit',
        url: singleTruck.routePermitFile,
        expDate: singleTruck.routePermitExpDate
      });
    }
    if (singleTruck.taxFile) {
      this.truckDocuments.push({
        name: 'Tax',
        url: singleTruck.taxFile,
        expDate: singleTruck.taxExpDate
      });
    }
    if (singleTruck.caseFile) {
      this.truckDocuments.push({
        name: 'Case',
        url: singleTruck.caseFile,
        expDate: singleTruck.caseExpDate
      });
    }
    if (singleTruck.otherFile) {
      this.truckDocuments.push({
        name: 'Other',
        url: singleTruck.otherFile,
        expDate: null
      });
    }
    return this.truckDocuments;
  }


  getDocument(singleDriver: UserModel) {
    this.documents = [];
    if (singleDriver.driverFilesUrls?.drivingLicenseFront) {
      this.documents.push({
        name: 'Driving License Front',
        url: singleDriver.driverFilesUrls?.drivingLicenseFront,
        expDate: singleDriver.drivingLicenseExpiryDate
      });
    }
    if (singleDriver.driverFilesUrls?.drivingLicenseBack) {
      this.documents.push({
        name: 'Driving License Back',
        url: singleDriver.driverFilesUrls?.drivingLicenseBack,
        expDate: singleDriver.drivingLicenseExpiryDate
      });
    }
    if (singleDriver.driverFilesUrls?.nidFront) {
      this.documents.push({
        name: 'NID Front',
        url: singleDriver.driverFilesUrls?.nidFront,
        expDate: null
      });
    }
    if (singleDriver.driverFilesUrls?.nidBack) {
      this.documents.push({
        name: 'NID Back',
        url: singleDriver.driverFilesUrls?.nidBack,
        expDate: null
      });
    }
    if (singleDriver.driverFilesUrls?.other) {
      this.documents.push({
        name: 'Other',
        url: singleDriver.driverFilesUrls?.other,
        expDate: null
      });
    }
    return this.documents;
  }

  onTruckUpdate() {
    console.log(this.truckUpdateForm)
    if (this.truckUpdateForm.valid) {
      const formData = new FormData();
      const payload: { [key: string]: any } = {};
      Object.keys(this.truckUpdateForm.controls).forEach(key => {
        const control = this.truckUpdateForm.get(key);
        const value = control.value;

        if (key.endsWith('File') || key === 'others') {
          if (value) {
            formData.append(key, value);
          }
        } else {
          payload[key] = value;
        }
      });
      formData.append('payload', JSON.stringify(payload));
      this.truck.editTruck(formData).subscribe((res: any) => {
          if (res.status === 'OK') {
            this.toastr.success(res.message);
            this.router.navigate(['/profile/truck']);
            this.isUploadPopupOpen.next(false);
            this.completeTruckUpload.next(true);
          } else {
            this.toastr.error(res.message);
            this.isUploadPopupOpen.next(false);
            this.completeTruckUpload.next(false);
          }
        },
        error => {
          this.toastr.error(error.error.message);
          this.isUploadPopupOpen.next(false);
          this.completeTruckUpload.next(false);
        }
      );
    }
  }

  onDriverUpdate(driverName: string, driverPhone: string) {
    this.driverUpdateForm.patchValue({
      driverName: driverName,
      driverPhone: driverPhone
    });
    if (this.driverUpdateForm.valid) {
      const formData = new FormData();
      const payload: { [key: string]: any } = {};

// Iterate over form controls
      Object.keys(this.driverUpdateForm.controls).forEach(key => {
        const control = this.driverUpdateForm.get(key);
        const value = control.value;

        if (key != 'driverName' && key != 'driverPhone' && key != 'driverId') {
          if (value) {
            formData.append(key, value);
          }
          // Append file controls directly to the FormData
        } else {
          // Add other controls to the payload object
          payload[key] = value;
        }
      });
      formData.append('payload', JSON.stringify(payload));

      this.service.editDriver(formData).subscribe((res: any) => {
          // Handle response
          if (res.status === 'OK') {
            this.toastr.success(res.message);
            this.router.navigate(['/profile/driver']);
            this.isUploadPopupOpen.next(false);
            this.completeUpload.next(true);
          } else {
            this.toastr.error(res.message);
            this.isUploadPopupOpen.next(false);
            this.completeUpload.next(false);
          }
        },
        error => {
          // Handle error
          this.toastr.error('Failed to add truck');
          this.isUploadPopupOpen.next(false);
        }
      );
    }
  }

  onClickTruckCloseButton(document: any) {
    this.truckDocuments = this.truckDocuments.filter((doc: any) => doc.name !== document.name);
    if (document.name === 'Registration Paper') {
      this.truckUpdateForm.patchValue({
        regPaperFile: null
      });
    } else if (document.name === 'Fitness') {
      this.truckUpdateForm.patchValue({
        fitnessCertificateFile: null,
        fitnessCertExpDate: null
      });
    } else if (document.name === 'Route Permit') {
      this.truckUpdateForm.patchValue({
        routePermitFile: null,
        routePermitExpDate: null
      });
    } else if (document.name === 'Tax') {
      this.truckUpdateForm.patchValue({
        taxFile: null,
        taxExpDate: null
      });
    } else if (document.name === 'Case') {
      this.truckUpdateForm.patchValue({
        casePaperFile: null,
        caseExpDate: null
      });
    } else if (document.name === 'Other') {
      this.truckUpdateForm.patchValue({
        otherFile: null
      });
    }
  }

  onClickCloseButton(document: any) {
    this.documents = this.documents.filter((doc: any) => doc.name !== document.name);
    if (document.name === 'Driving License Front') {
      this.driverUpdateForm.patchValue({drivingLicenseFront: null});
    } else if (document.name === 'Driving License Back') {
      this.driverUpdateForm.patchValue({drivingLicenseBack: null});
    } else if (document.name === 'NID Front') {
      this.driverUpdateForm.patchValue({nidFront: null});
    } else if (document.name === 'NID Back') {
      this.driverUpdateForm.patchValue({nidBack: null});
    } else if (document.name === 'Other') {
      this.driverUpdateForm.patchValue({other: null});
    }
  }

  onChangeFile($event: any) {
    if ($event.length) {
      $event.forEach((file: any) => {
        this.documents.push({
          name: file.registrationType,
          url: file.preview
        });
        switch (file.registrationType) {
          case 'Driving License Front':
            this.driverUpdateForm.patchValue({drivingLicenseFront: file.file});
            break;
          case 'Driving License Back':
            this.driverUpdateForm.patchValue({drivingLicenseBack: file.file});
            break;
          case 'NID Front':
            this.driverUpdateForm.patchValue({nidFront: file.file});
            break;
          case 'NID Back':
            this.driverUpdateForm.patchValue({nidBack: file.file});
            break;
          case 'Other':
            this.driverUpdateForm.patchValue({other: file.file});
            break;
        }
      });
    }
  }

  onChangeTruckFile($event: any) {
    if ($event.length) {
      $event.forEach((file: any) => {
        this.truckDocuments.push({
          name: file.registrationType,
          url: file.preview,
          expDate: file.registrationExpireDate
        });
        switch (file.registrationType) {
          case 'Registration Paper':
            this.truckUpdateForm.patchValue({
              regPaperFile: file.file,
            });
            break;
          case 'Fitness':
            this.truckUpdateForm.patchValue({
              fitnessCertificateFile: file.file,
              fitnessCertExpDate: file.registrationExpireDate
            });
            break;
          case 'Route Permit':
            this.truckUpdateForm.patchValue({
              routePermitFile: file.file,
              routePermitExpDate: file.registrationExpireDate
            });
            break;
          case 'Tax':
            this.truckUpdateForm.patchValue({
              taxFile: file.file,
              taxExpDate: file.registrationExpireDate
            });
            break;
          case 'Case':
            this.truckUpdateForm.patchValue({
              casePaperFile: file.file,
              caseExpDate: file.registrationExpireDate
            });
            break;
          case 'Other':
            this.truckUpdateForm.patchValue({
              others: file.file,
            });
            break;
        }
      });
    }
  }
}
