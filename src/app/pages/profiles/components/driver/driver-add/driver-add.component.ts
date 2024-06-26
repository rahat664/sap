import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {FileUploadPopupComponent} from "../../truck/file-upload-popup/file-upload-popup.component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {driverFileType} from "../../customer/model/driver-file-type";
import {UserService} from "../../../services/user.service";
import {ToastrService} from "ngx-toastr";
import {ValidationService} from "../../../../../shared/services/validation/validation.service";


@Component({
  selector: 'app-driver-add',
  standalone: true,
  imports: [
    NgIf,
    UploadButtonComponent,
    FileUploadPopupComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './driver-add.component.html',
  styleUrl: './driver-add.component.scss'
})
export class DriverAddComponent implements OnInit {
  driverAddForm: FormGroup;
  driverPhoneErrorMessage: string;

  constructor(private fb: FormBuilder, private validation: ValidationService, private router: Router, private service: UserService, private toastr: ToastrService) {
    this.driverAddForm = this.fb.group({
      driverName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      driverPhone: ['', [Validators.required, Validators.pattern('01[0-9]{9}'), Validators.minLength(11), Validators.maxLength(11)]],
      nidFront: [null],
      nidBack: [null],
      drivingLicenseFront: [null],
      drivingLicenseBack: [null],
      other: [null],
      drivingLicenseExpiryDate: [null],
    });
  }

  ngOnInit(): void {
    this.driverAddForm.get('driverName').valueChanges.subscribe((value: string) => {
      if (this.driverAddForm.get('driverName').hasError('required')) {
        this.driverNameErrorMessage = 'You must enter a value';
      } else {
        this.driverNameErrorMessage = '';
      }
    });
    this.driverAddForm.get('driverPhone').valueChanges.subscribe((value: string) => {
      this.numberOnlyValidation(value);
      this.driverPhoneErrorMessage = this.validation.getDriverNumberValidation(this.driverAddForm.get('driverPhone'));
    });
  }

  onAddFile($event: any) {
    $event.forEach(($event: any) => {
      switch ($event.registrationType) {
        case 'NID Front':
          this.driverAddForm.get('nidFront').setValue($event.file);
          this.driverAddForm.patchValue({
            nidFront: $event.file
          })
          break;
        case 'NID Back':
          this.driverAddForm.patchValue({
            nidBack: $event.file
          })
          break;
        case 'Driving License Front':
          this.driverAddForm.patchValue({
            drivingLicenseFront: $event.file,
            drivingLicenseExpiryDate: $event.registrationExpireDate
          })
          break;
        case 'Driving License Back':
          this.driverAddForm.patchValue({
            drivingLicenseBack: $event.file
          })
          break;
        case 'Other':
          this.driverAddForm.patchValue({
            other: $event.file
          })
          break;
      }
    });
  }

  protected readonly driverFileType = driverFileType;
  driverName: string;
  driverPhone: string;
  driverNameErrorMessage: string;

  onDriverSave() {
    if (this.driverAddForm.valid) {
      if (!this.driverAddForm.get('drivingLicenseExpiryDate').value) {
        this.driverAddForm.removeControl('drivingLicenseExpiryDate')
      }
      const formData = new FormData();
      const payload: Record<string, any> = {};

// Iterate over form controls
      Object.keys(this.driverAddForm.controls).forEach(key => {
        const control = this.driverAddForm.get(key);
        const value = control.value;

        if (key != 'driverName' && key != 'driverPhone' && key != 'drivingLicenseExpiryDate') {
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

      this.service.addDriver(formData).subscribe((res: any) => {
          // Handle response
          if (res.status == "OK") {
            this.toastr.success(res.message);
            this.router.navigate(['/profile/driver']);
          } else {
            this.toastr.error(res.message);
          }
        },
        error => {
          // Handle error
          this.toastr.error(error.error.message)
        }
      );
    } else {
      this.driverAddForm.markAllAsTouched();
      this.driverPhoneErrorMessage = this.validation.getDriverNumberValidation(this.driverAddForm.get('driverPhone'));
      if (this.driverAddForm.get('driverName').hasError('required')) {
        this.driverNameErrorMessage = 'You must enter a value';
      }
    }
  }

  private numberOnlyValidation(value: any) {
    if (isNaN(value)) {
      this.driverAddForm?.get('driverPhone').setValue('');
    }
    if (value?.substring(0, 1) != '0' && value?.substring(0, 1)){
      this.driverAddForm?.get('driverPhone').setErrors({invalidNumber: true});
    }
    if (value?.substring(1, 2) != '1' && value?.substring(1, 2)){
      this.driverAddForm?.get('driverPhone').setErrors({invalidNumber: true});
    }
    const onlyNumbers = value?.replace(/[^\d]/g, '');
    if (onlyNumbers.length > 11) {
      this.driverAddForm?.get('driverPhone').setValue(onlyNumbers.substring(0, 11));
    }
  }

  getDriverPhoneErrorWithoutTouch() {
    console.log(this.driverAddForm?.get('driverPhone').hasError('invalidNumber'))
    if (this.driverAddForm?.get('driverPhone').hasError('invalidNumber')) {
      return 'Invalid driver number';
    } else {
      return '';
    }
  }

  getDriverPhoneErrorWithTouch() {
    if (this.driverAddForm?.get('driverPhone').hasError('required')) {
      return 'Driver number required';
    } else if (this.driverAddForm?.get('driverPhone').hasError('minlength')) {
      return 'Invalid driver number';
    } else if (this.driverAddForm?.get('driverPhone').hasError('maxlength')) {
      return 'Invalid driver number';
    } else if (this.driverAddForm?.get('driverPhone').hasError('invalidNumber')) {
      return 'Invalid driver number';
    } else {
      return '';
    }
  }

  getDriverNameError() {
    if (this.driverAddForm?.get('driverName').hasError('required')) {
      return 'Driver name required';
    } else if (this.driverAddForm?.get('driverName').hasError('minlength')) {
      return 'Invalid driver name';
    } else if (this.driverAddForm?.get('driverName').hasError('maxlength')) {
      return 'Invalid driver name';
    } else {
      return '';
    }
  }
}
