import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {UploadButtonComponent} from "../../../../../shared/modules/upload-button/upload-button.component";
import {manufacturerList} from "../models/manufacturer-list";
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {CustomInputSelectModel} from '../../../../../shared/modules/custom-input/custom-input-select.model';
import {TruckInnerModel} from "../models/truck-inner.model";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {TruckService} from "../services/truck.service";
import {ToastrService} from "ngx-toastr";
import {registrationCategoryList} from "../models/registration-category";
import {registrationZoneList} from "../models/registration-zone";
import {Router} from "@angular/router";

@Component({
  selector: 'app-truck-details',
  standalone: true,
  imports: [
    NgIf,
    UploadButtonComponent,
    CustomInputComponent,
    GetClickEventDirective,
    NgClass,
    NgForOf,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './truck-details.component.html',
  styleUrl: './truck-details.component.scss'
})
export class TruckDetailsComponent implements OnInit{
  inEditMode: boolean = false;
  manufacturerList: CustomInputSelectModel[] = manufacturerList;
  manufactureOpened: boolean;
  manufacturerPlaceholder: string;
  registrationTypePlaceholder: string;
  registrationOpenedType: boolean;
  registrationListType: CustomInputSelectModel[] = registrationCategoryList;
  registrationZoneList: CustomInputSelectModel[] = registrationZoneList;
  registrationZoneOpened: boolean;
  registrationZonePlaceholder: string;
  singleTruck: TruckInnerModel;
  documents: any[] = [];
  truckAddForm: FormGroup;
  isExpiryAvailable: boolean;

  constructor(
    private fb: FormBuilder,
    private service: TruckService,
    private toastr: ToastrService,
    private router: Router
  ) {
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

  onClickManufacturer($event: boolean) {
    this.manufactureOpened = $event;
  }

  onSelectManuFacturer($event: number) {
    this.manufacturerPlaceholder = this.manufacturerList.find(x => x.id === $event).value;
    this.manufacturerList.forEach(x => x.selected = x.id === $event);
    this.manufactureOpened = false;
  }

  onSelectRegistrationype($event: number) {
    this.registrationTypePlaceholder = this.registrationListType.find(x => x.id === $event).value;
    this.registrationListType.forEach(x => x.selected = x.id === $event);
    this.registrationOpenedType = false;
    this.truckAddForm.patchValue({
      registration_category: this.registrationTypePlaceholder
    });
  }

  onClickRegistrationType($event: boolean) {
    this.registrationOpenedType = $event;
  }

  onClickRegistrationZone($event: boolean) {
    this.registrationZoneOpened = $event;
  }

  onSelectRegistrationZone($event: number) {
    this.registrationZonePlaceholder = this.registrationZoneList.find(x => x.id === $event).value;
    this.registrationZoneList.forEach(x => x.selected = x.id === $event);
    this.registrationZoneOpened = false;
    this.truckAddForm.patchValue({
      registration_zone: this.registrationZonePlaceholder
    });
  }

  getFullRegistrationName() {
    return `${this.singleTruck.registration_zone} ${this.singleTruck.registration_category} ${this.singleTruck.registration_serial} ${this.singleTruck.registration_num}`
  }

  ngOnInit(): void {

    this.singleTruck = JSON.parse(localStorage.getItem('truck'));
    this.bindSingleTruckInForm(this.singleTruck);
    if (this.singleTruck.routePermitFile){
      this.documents.push({name: 'Route Permit', file: this.singleTruck.routePermitFile, expDate: this.singleTruck.routePermitExpDate});
    } if (this.singleTruck.fitnessCertFile){
      this.documents.push({name: 'Fitness Certificate', file: this.singleTruck.fitnessCertFile, expDate: this.singleTruck.fitnessCertExpDate});
    } if (this.singleTruck.taxFile){
      this.documents.push({name: 'Tax', file: this.singleTruck.taxFile, expDate: this.singleTruck.taxExpDate});
    }  if (this.singleTruck.caseFile){
      this.documents.push({name: 'Case', file: this.singleTruck.caseFile, expDate: this.singleTruck.caseExpDate});
    }  if (this.singleTruck.otherFile){
      this.documents.push({name: 'Other', file: this.singleTruck.otherFile, expDate: 'N/A'});
    }  if (this.singleTruck.regPaperFile){
      this.documents.push({name: 'Registration Paper', file: this.singleTruck.regPaperFile, expDate: 'N/A'});
    }  if (this.singleTruck.fitnessFile){
      this.documents.push({name: 'Fitness', file: this.singleTruck.fitnessFile, expDate: 'N/A'});
    }
    this.truckAddForm.get('registration_serial').valueChanges.subscribe((value) => {
      this.numberOnly(value);
    });
    this.truckAddForm.get('registration_num').valueChanges.subscribe((value) => {
      this.numberOnly(value);
    });
  }

  onClickSave() {
    if (this.truckAddForm.valid) {
      const model = {
        id: this.singleTruck.id,
        name: "truck 1",
        registration_zone: this.truckAddForm.get('registration_zone').value,
        registration_category: this.truckAddForm.get('registration_category').value,
        registration_serial: this.truckAddForm.get('registration_serial').value,
        registration_num: this.truckAddForm.get('registration_num').value,
        //"driver_code":"",
        driver_name: "Test2",
        driver_phone: "01710666666",
        helper_code: "sl-2",
        helper_name: "Test2",
        helper_phone: "01111111112"
      }
      this.service.editTruck(model).subscribe((res: any) => {
        this.toastr.success('Truck updated successfully');
        this.inEditMode = false;
        this.router.navigate(['/profile/truck']);
      });
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

  onClickEdit() {
    this.inEditMode = !this.inEditMode;
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
  protected readonly Date = Date;

  private bindSingleTruckInForm(singleTruck: TruckInnerModel) {
    this.registrationZonePlaceholder = singleTruck.registration_zone;
    this.registrationTypePlaceholder = singleTruck.registration_category;
    this.truckAddForm.patchValue({
      registration_zone: singleTruck.registration_zone,
      registration_category: singleTruck.registration_category,
      registration_serial: singleTruck.registration_serial,
      registration_num: singleTruck.registration_num,
      regPaperFile: singleTruck.regPaperFile,
      fitnessCertFile: singleTruck.fitnessCertFile,
      fitnessCertExpDate: singleTruck.fitnessCertExpDate,
      routePermitFile: singleTruck.routePermitFile,
      routePermitExpDate: singleTruck.routePermitExpDate,
      taxFile: singleTruck.taxFile,
      taxExpDate: singleTruck.taxExpDate,
      caseFile: singleTruck.caseFile,
      caseExpDate: singleTruck.caseExpDate,
      otherFile: singleTruck.otherFile,
      checklist: singleTruck.preHireCheckList
    });
  }
}
