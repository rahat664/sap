import {Injectable, OnInit} from '@angular/core';
import {UserModel} from "../../user-management/models/user.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {UserService} from "./user.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DriverEditSharedService{
  driverName: string;
  driverPhone: string;
  documents: any[] = [];
  driverUpdateForm: FormGroup;
  isUploadPopupOpen: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  completeUpload: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.driverUpdateForm = this.fb.group({
      driverId: [''],
      driverName: [''],
      driverPhone: [''],
      nidFront: [null],
      nidBack: [null],
      drivingLicenseFront: [null],
      drivingLicenseBack: [null],
      other: [null]
    });
  }

  bindDriverValueWithForm(singleDriver: UserModel) {
    this.driverName = singleDriver.name;
    this.driverPhone = singleDriver.phone;
    this.driverUpdateForm.patchValue({
      driverName: singleDriver.name,
      driverPhone: singleDriver.phone,
      driverId: singleDriver.userId
    });
    const nidFrontFile = new File([], singleDriver.driverFilesUrls.nidFront);
    const nidBackFile = new File([], singleDriver.driverFilesUrls.nidBack);
    const drivingLicenseFrontFile = new File([], singleDriver.driverFilesUrls.drivingLicenseFront);
    const drivingLicenseBackFile = new File([], singleDriver.driverFilesUrls.drivingLicenseBack);
    const otherFile = new File([], singleDriver.driverFilesUrls.other);
    singleDriver.driverFilesUrls.nidFront ? this.driverUpdateForm.patchValue({nidFront: nidFrontFile}) : null;
    singleDriver.driverFilesUrls.nidBack ? this.driverUpdateForm.patchValue({nidBack: nidBackFile}) : null;
    singleDriver.driverFilesUrls.drivingLicenseFront ? this.driverUpdateForm.patchValue({drivingLicenseFront: drivingLicenseFrontFile}) : null;
    singleDriver.driverFilesUrls.drivingLicenseBack ? this.driverUpdateForm.patchValue({drivingLicenseBack: drivingLicenseBackFile}) : null;
    singleDriver.driverFilesUrls.other ? this.driverUpdateForm.patchValue({other: otherFile}) : null;
  }


  getDocument(singleDriver: UserModel) {
    this.documents = [];
    if (singleDriver.driverFilesUrls.drivingLicenseFront) {
      this.documents.push({
        name: 'Driving License Front',
        url: singleDriver.driverFilesUrls.drivingLicenseFront
      });
    }
    if (singleDriver.driverFilesUrls.drivingLicenseBack) {
      this.documents.push({
        name: 'Driving License Back',
        url:singleDriver.driverFilesUrls.drivingLicenseBack
      });
    }
    if (singleDriver.driverFilesUrls.nidFront) {
      this.documents.push({
        name: 'NID Front',
        url:singleDriver.driverFilesUrls.nidFront
      });
    }
    if (singleDriver.driverFilesUrls.nidBack) {
      this.documents.push({
        name: 'NID Back',
        url:singleDriver.driverFilesUrls.nidBack
      });
    }
    if (singleDriver.driverFilesUrls.other) {
      this.documents.push({
        name: 'Other',
        url:singleDriver.driverFilesUrls.other
      });
    }
    return this.documents;
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
}
