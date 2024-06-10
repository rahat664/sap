import {Component} from '@angular/core';
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {UserModel} from "../../../../user-management/models/user.model";
import {FormBuilder, FormGroup, FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {TruckService} from "../../truck/services/truck.service";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    NgIf,
    UploadButtonComponent,
    NgClass,
    NgForOf,
    FormsModule
  ],
  templateUrl: './driver-details.component.html',
  styleUrl: './driver-details.component.scss'
})
export class DriverDetailsComponent {
  inEditMode: boolean = false;
  singleDriver: UserModel;
  documents: any[] = [];
  driverName: string;
  driverPhone: string;
  private driverUpdateForm: FormGroup;

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

  ngOnInit(): void {
    this.singleDriver = JSON.parse(localStorage.getItem('driver'));
    this.bindDriverValueWithForm(this.singleDriver);
    if (this.singleDriver.driverFilesUrls.drivingLicenseFront) {
      this.documents.push({
        name: 'Driving License Front',
        url: this.singleDriver.driverFilesUrls.drivingLicenseFront
      });
    }
    if (this.singleDriver.driverFilesUrls.drivingLicenseBack) {
      this.documents.push({
        name: 'Driving License Back',
        url: this.singleDriver.driverFilesUrls.drivingLicenseBack
      });
    }
    if (this.singleDriver.driverFilesUrls.nidFront) {
      this.documents.push({
        name: 'NID Front',
        url: this.singleDriver.driverFilesUrls.nidFront
      });
    }
    if (this.singleDriver.driverFilesUrls.nidBack) {
      this.documents.push({
        name: 'NID Back',
        url: this.singleDriver.driverFilesUrls.nidBack
      });
    }
    if (this.singleDriver.driverFilesUrls.other) {
      this.documents.push({
        name: 'Other',
        url: this.singleDriver.driverFilesUrls.other
      });
    }
  }

  private bindDriverValueWithForm(singleDriver: UserModel) {
    this.driverName = singleDriver.name;
    this.driverPhone = singleDriver.phone;
    this.driverUpdateForm.patchValue({
      driverName: singleDriver.name,
      driverPhone: singleDriver.phone,
      driverId: singleDriver.userId
    });
    // bind link as a file in the form
  }

  // fetchFileFromUrl(url: string) {
  //   this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
  //     const fileName = url.split('/').pop();
  //     const file = new File([blob], fileName, { type: blob.type });
  //
  //     if (fileInput) {
  //       fileInput.setValue(file);
  //     }
  //   });
  // }

  onDriverUpdate() {
    this.driverUpdateForm.patchValue({
      driverName: this.driverName,
      driverPhone: this.driverPhone
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
