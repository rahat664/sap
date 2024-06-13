import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {FileUploadPopupComponent} from "../../truck/file-upload-popup/file-upload-popup.component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {driverFileType} from "../../customer/model/driver-file-type";
import {UserService} from "../../../services/user.service";
import {ToastrService} from "ngx-toastr";


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

  constructor(private fb: FormBuilder, private router: Router, private service: UserService, private toastr: ToastrService) {
    this.driverAddForm=this.fb.group({
      driverName: [''],
      driverPhone: [''],
      nidFront: [null],
      nidBack: [null],
      drivingLicenseFront: [null],
      drivingLicenseBack: [null],
      other: [null],
      drivingLicenseExpiryDate: [null],
    });
  }

  ngOnInit(): void {

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

  onDriverSave() {
    this.driverAddForm.patchValue({
      driverName: this.driverName,
      driverPhone: this.driverPhone
    });
    if (this.driverAddForm.valid) {
      if (!this.driverAddForm.get('drivingLicenseExpiryDate').value) {
        this.driverAddForm.removeControl('drivingLicenseExpiryDate')
      }
      const formData = new FormData();
      const payload: { [key: string]: any } = {};

// Iterate over form controls
      Object.keys(this.driverAddForm.controls).forEach(key => {
        const control = this.driverAddForm.get(key);
        const value = control.value;

        if (key != 'driverName' && key != 'driverPhone' && key != 'drivingLicenseExpiryDate'){
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
    }
  }
}
