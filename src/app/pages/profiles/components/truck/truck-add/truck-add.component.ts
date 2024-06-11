import {Component, OnInit} from '@angular/core';
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {NgClass, NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {FileUploadPopupComponent} from "../file-upload-popup/file-upload-popup.component";
import {manufacturerList} from "../models/manufacturer-list";
import {CustomInputSelectModel} from '../../../../../shared/modules/custom-input/custom-input-select.model';
import {registrationZoneList} from "../models/registration-zone";
import {registrationCategoryList} from "../models/registration-category";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {TruckService} from "../services/truck.service";
import {PreHireChecklistModel} from "../models/pre-hire-checklist.model";
import {PreHireChecklistComponent} from "../pre-hire-checklist/pre-hire-checklist.component";
import {CreatePopupComponent} from "../../../../../shared/modal/create-popup/create-popup.component";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";

@Component({
  selector: 'app-truck-add',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    NgIf,
    UploadButtonComponent,
    NgClass,
    FileUploadPopupComponent,
    ReactiveFormsModule,
    PreHireChecklistComponent,
    CreatePopupComponent
  ],
  templateUrl: './truck-add.component.html',
  styleUrl: './truck-add.component.scss'
})
export class TruckAddComponent implements OnInit {

  manufacturerList = manufacturerList;
  manufactureOpened: boolean;
  manufacturerPlaceholder: string;
  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened: boolean;
  registrationZonePlaceholder: string;
  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationOpenedType: boolean;
  registrationTypePlaceholder: string;
  truckAddForm: FormGroup;
  prehireChecklist: PreHireChecklistModel[] = [];
  singleChecklist: any = {};
  prehireCheckListOpened: boolean;
  isExpiryAvailable: boolean;

  constructor(private fb: FormBuilder, private service: TruckService, private toastr: ToastrService, private router: Router) {
    this.truckAddForm = this.fb.group({
      registration_zone: [null],
      registration_category: [null],
      registration_serial: [null],
      registration_num: [null],
      regPaperFile: [null],
      fitnessCertFile: [null],
      fitnessCertExpDate: [null],
      routePermitFile: [null],
      routePermitExpDate: [null],
      taxFile: [null],
      taxExpDate: [null],
      caseFile: [null],
      caseExpDate: [null],
      otherFile: [null],
      checklist: [null],
    });
  }

  onSelectManuFacturer($event: number) {
    this.manufacturerPlaceholder = this.manufacturerList.find(option => option.id === $event).value;
    this.manufacturerList.forEach(option => {
      option.selected = option.id === $event;
    });
  }

  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }

  onSelectRegistrationZone($event: number) {
    this.registrationZonePlaceholder = this.registrationZoneList.find(option => option.id === $event).value;
    this.registrationZoneList.forEach(option => {
      option.selected = option.id === $event;
    });
    this.registrationZoneOpened = false;
    this.truckAddForm.patchValue({
      registration_zone: this.registrationZonePlaceholder
    });
  }

  onClickRegistrationType($event: boolean) {
    this.registrationOpenedType = $event;
  }

  onSelectRegistrationType($event: number) {
    this.registrationTypePlaceholder = this.registrationListType.find(option => option.id === $event).value;
    this.registrationListType.forEach(option => {
      option.selected = option.id === $event;
    });
    this.registrationOpenedType = false;
    this.truckAddForm.patchValue({
      registration_category: this.registrationTypePlaceholder
    });
  }

  onClickManufacturer($event: boolean) {
    this.manufactureOpened = $event;
  }

  ngOnInit(): void {
    this.truckAddForm.get('registration_serial').valueChanges.subscribe((value) => {
      this.numberOnly(value);
    });
    this.truckAddForm.get('registration_num').valueChanges.subscribe((value) => {
      this.numberOnly(value);
    });
  }

  onClickSave() {
    if (this.truckAddForm.valid) {
      const formData = new FormData();
      const payload: { [key: string]: any } = {};

// Iterate over form controls
      Object.keys(this.truckAddForm.controls).forEach(key => {
        const control = this.truckAddForm.get(key);
        const value = control.value;

        if (key.endsWith('File')) {
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

      this.service.addTruck(formData).subscribe((res: any) => {
          // Handle response
          this.toastr.success('Truck added successfully');
          this.router.navigate(['/profile/truck']);
        },
        error => {
          // Handle error
          this.toastr.error('Failed to add truck');
        }
      );
    }
  }

  onAddFile($event: any) {
    $event.forEach((file: any) => {
      switch (file.registrationType) {
        case 'Registration Paper':
          this.isExpiryAvailable = false;
          this.truckAddForm.patchValue({
            regPaperFile: file.file,
          });
          break;
        case 'Fitness':
          this.isExpiryAvailable = true;
          this.truckAddForm.patchValue({
            fitnessCertFile: file.file,
            fitnessCertExpDate: file.registrationExpireDate
          });
          break;
        case 'Route Permit':
          this.isExpiryAvailable = true;
          this.truckAddForm.patchValue({
            routePermitFile: file.file,
            routePermitExpDate: file.registrationExpireDate
          });
          break;
        case 'Tax':
          this.isExpiryAvailable = true;
          this.truckAddForm.patchValue({
            taxFile: file.file,
            taxExpDate: file.registrationExpireDate
          });
          break;
        case 'Case':
          this.isExpiryAvailable = true;
          this.truckAddForm.patchValue({
            caseFile: file.file,
            caseExpDate: file.registrationExpireDate
          });
          break;
        case 'Other':
          this.isExpiryAvailable = false;
          this.truckAddForm.patchValue({
            otherFile: file.file,
            otherExpire: file.registrationExpireDate
          });
          break;
      }
    });
  }

  private numberOnly(value: any) {
    const reg = /^[0-9]*$/;
    if (!reg.test(value)) {
      this.truckAddForm.patchValue({
        registration_serial: value.replace(/[^0-9]/g, ''),
        registration_num: value.replace(/[^0-9]/g, '')
      });
    }
  }

  onClickPrehiredChecklist($event: any) {
    this.prehireCheckListOpened = $event;
    this.singleChecklist = $event;
    this.truckAddForm.patchValue({
      checklist: $event
    })
  }
}
