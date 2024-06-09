import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {FileUploadPopupComponent} from "../../truck/file-upload-popup/file-upload-popup.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
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
    ReactiveFormsModule
  ],
  templateUrl: './driver-add.component.html',
  styleUrl: './driver-add.component.scss'
})
export class DriverAddComponent implements OnInit {
  driverAddForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private service: UserService, private toastr: ToastrService) {
    this.fb.group({
      driverName: [''],
      driverPhone: [''],
      nidFront: [''],
      nidBack: [''],
      drivingLicenseFront: [''],
      drivingLicenseBack: [''],
      other: ['']
    });
  }

  ngOnInit(): void {

  }

  onAddFile($event: any) {
    switch ($event.registrationType) {
      case 'NID Front':
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
          drivingLicenseFront: $event.file
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
  }

  protected readonly driverFileType = driverFileType;

  onDriverSave() {
    if (this.driverAddForm.valid) {
      const formData = new FormData();
      const payload: { [key: string]: any } = {};

// Iterate over form controls
      Object.keys(this.driverAddForm.controls).forEach(key => {
        const control = this.driverAddForm.get(key);
        const value = control.value;

        if (key != 'driverName' && key != 'driverPhone'){
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
          this.toastr.success('Driver added successfully');
          this.router.navigate(['/profile/driver']);
        },
        error => {
          // Handle error
          this.toastr.error('Failed to add truck');
        }
      );
    }
  }
}
