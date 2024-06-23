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
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TruckService} from "../services/truck.service";
import {PreHireChecklistComponent} from "../pre-hire-checklist/pre-hire-checklist.component";
import {CreatePopupComponent} from "../../../../../shared/modal/create-popup/create-popup.component";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {ValidationService} from "../../../../../shared/services/validation/validation.service";

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
  singleChecklist: any = {};
  prehireCheckListOpened: boolean;
  isExpiryAvailable: boolean;
  registrationErrorMessage: string = '';
  registrationCategoryErrorMessage: string = '';
  registrationSerialErrorMessage: string = '';
  registrationNumErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private toastr: ToastrService,
    private router: Router,
    private validation: ValidationService) {
    this.truckAddForm = this.fb.group({
      registration_zone: [null, Validators.required],
      registration_category: [null, Validators.required],
      registration_serial: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2), Validators.pattern('^[0-9]*$')]],
      registration_num: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]*$')]],
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
    this.registrationErrorMessage = '';
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
    this.registrationCategoryErrorMessage = '';
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
      this.registrationSerialErrorMessage = this.validation.getRegistrationSerialValidation(this.truckAddForm.get('registration_serial'));
    });
    this.truckAddForm.get('registration_num').valueChanges.subscribe((value) => {
      this.numberOnly(value);
      this.registrationNumErrorMessage = this.validation.getRegistrationSerialValidation(this.truckAddForm.get('registration_num'));
    });
  }

  onClickSave() {
    console.log(this.truckAddForm);
    if (this.truckAddForm.valid) {
      const formData = new FormData();
      const payload: { [key: string]: any } = {};

// Iterate over form controls
      Object.keys(this.truckAddForm.controls).forEach(key => {
        const control = this.truckAddForm.get(key);
        const value = control.value;

        if (key.endsWith('File') || key === 'others') {
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
          if (res.status == "OK") {
            this.toastr.success(res.message);
            this.router.navigate(['/profiles/truck']);
          } else {
            this.toastr.error(res.message);
          }
        },
        error => {
          // Handle error
          this.toastr.error(error.error.message);
        }
      );
    }
    else {
      this.truckAddForm.markAllAsTouched();
      this.registrationErrorMessage = this.validation.getDropdownValidation(this.truckAddForm.get('registration_zone'));
      this.registrationCategoryErrorMessage = this.validation.getDropdownValidation(this.truckAddForm.get('registration_category'));
      this.registrationSerialErrorMessage = this.validation.getRegistrationSerialValidation(this.truckAddForm.get('registration_serial'));
      this.registrationNumErrorMessage = this.validation.getRegistrationSerialValidation(this.truckAddForm.get('registration_num'));
      console.log(this.registrationErrorMessage);
    }
  }

  onAddFile($event: any) {
    $event.forEach((file: any) => {
      switch (file.registrationType) {
        case 'Registration Paper':
          this.truckAddForm.patchValue({
            regPaperFile: file.file,
          });
          break;
        case 'Fitness':
          this.isExpiryAvailable = true;
          this.truckAddForm.patchValue({
            fitnessCertificateFile: file.file,
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
          this.truckAddForm.patchValue({
            taxFile: file.file,
            taxExpDate: file.registrationExpireDate
          });
          break;
        case 'Case':
          this.truckAddForm.patchValue({
            casePaperFile: file.file,
            caseExpDate: file.registrationExpireDate
          });
          break;
        case 'Other':
          this.isExpiryAvailable = false;
          this.truckAddForm.patchValue({
            others: file.file,
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
    this.prehireCheckListOpened = !$event;
    this.singleChecklist = $event;
    this.truckAddForm.patchValue({
      checklist: $event
    })
  }
}
