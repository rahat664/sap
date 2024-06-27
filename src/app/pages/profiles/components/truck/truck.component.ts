import { Component, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { NgForOf, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TransporterAddComponent } from '../transporter/transporter-add/transporter-add.component';
import { TruckModel } from './models/truck.model';
import { TruckService } from './services/truck.service';
import { RouterLink } from '@angular/router';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { manufacturerList } from './models/manufacturer-list';
import { FileUploadPopupComponent } from './file-upload-popup/file-upload-popup.component';
import { TruckInnerModel } from './models/truck-inner.model';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { DriverEditSharedService } from '../../services/driver-edit-shared.service';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { debounceTime } from 'rxjs';
import { CheckListPopupComponent } from '../../../../shared/modal/check-list-popup/check-list-popup.component';
import { PreHireChecklistComponent } from './pre-hire-checklist/pre-hire-checklist.component';

@Component({
  selector: 'app-truck',
  standalone: true,
  imports: [
    CreatePopupComponent,
    CustomInputComponent,
    GetClickEventDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    TransporterAddComponent,
    RouterLink,
    UploadButtonComponent,
    FileUploadPopupComponent,
    LoadingComponent,
    CheckTheHeightCrossMaxHeightOrNotDirective,
    CheckListPopupComponent,
    PreHireChecklistComponent,
  ],
  templateUrl: './truck.component.html',
  styleUrl: './truck.component.scss',
})
export class TruckComponent implements OnInit {
  height = '';
  truckList: TruckInnerModel[] = [];
  manufactureOpened: boolean;
  manufacturerList: CustomInputSelectModel[] = manufacturerList;
  manufacturerPlaceholder = '';
  trackerAddOpened = false;
  selectedTruckId: number;
  isOpen = false;
  preHireCheckList: any[] = [];
  loading: boolean;
  isNewOpen: boolean;
  singleTruck: TruckInnerModel;
  newDriverFileType: CustomInputSelectModel[] = [];
  private page = 0;
  totalPages: number;
  searchValue: string;
  isCheckListOpened: boolean = false;
  singleTruckId: number;

  constructor(
    private service: TruckService,
    private shared: DriverEditSharedService
  ) {}

  ngOnInit(): void {
    this.getTruckList();
    this.makeSureUploadCompletedOrNot();
  }

  private getTruckList() {
    this.page = 0;
    this.loading = true;
    if (this.searchValue) {
      //subscribe with debounce time
      this.service
        .getTruckList(this.page, this.searchValue)
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          res.data.responses.forEach((truck: TruckModel) => {
            truck.truck.preHireCheckList = String(truck.preHireChecklistList);
            truck.truck.noOfTrips = truck.noOfTrips;
            this.truckList.push(truck.truck);
          });
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else {
      this.service.getTruckList(this.page).subscribe((res: any) => {
        res.data.responses.forEach((truck: TruckModel) => {
          truck.truck.preHireCheckList = String(truck.preHireChecklistList);
          truck.truck.noOfTrips = truck.noOfTrips;
          this.truckList.push(truck.truck);
        });
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    }
  }

  getFullRegistrationName(truck: TruckInnerModel) {
    return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial}-${truck.registrationNum}`;
  }

  onClickManufacturer($event: boolean) {
    this.manufactureOpened = $event;
  }

  onSelectManuFacturer($event: number) {
    this.manufacturerPlaceholder = this.manufacturerList.find(
      (manufacturer: CustomInputSelectModel) => manufacturer.id === $event
    ).value;
  }

  onClickAddTracker(id: number) {
    if (id === this.selectedTruckId) {
      this.trackerAddOpened = !this.trackerAddOpened;
    } else {
      this.trackerAddOpened = true;
    }
    this.selectedTruckId = id;
  }

  onClickAddTruckerSave() {
    this.trackerAddOpened = false;
  }

  onClickTruckDetails(truck: TruckInnerModel) {
    localStorage.removeItem('truck');
    localStorage.setItem('truck', JSON.stringify(truck));
  }

  onClickUpdate(fit: string, truck: TruckInnerModel) {
    this.isNewOpen = true;
    this.singleTruck = truck;
    this.isOpen = true;
    if (fit == 'fit') {
      this.newDriverFileType = [{ id: 2, value: 'Fitness', selected: false }];
    }
    if (fit == 'reg') {
      this.newDriverFileType = [
        { id: 1, value: 'Registration Paper', selected: false },
      ];
    }
    if (fit == 'route') {
      this.newDriverFileType = [
        { id: 3, value: 'Route Permit', selected: false },
      ];
    }
    if (fit == 'tax') {
      this.newDriverFileType = [{ id: 4, value: 'Tax', selected: false }];
    }
    if (fit == 'case') {
      this.newDriverFileType = [{ id: 5, value: 'Case', selected: false }];
    }
    if (fit == 'other') {
      this.newDriverFileType = [{ id: 6, value: 'Other', selected: false }];
    }
  }

  private makeSureUploadCompletedOrNot() {
    this.shared.completeTruckUpload.subscribe((res: boolean) => {
      if (res) {
        this.isNewOpen = false;
        this.isOpen = false;
        this.searchValue = '';
        this.truckList = [];
        this.getTruckList();
      }
    });
  }
  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      if (this.searchValue) {
        this.service
          .getTruckList(this.page, this.searchValue)
          .pipe(debounceTime(500))
          .subscribe((res: any) => {
            res.data.responses.forEach((truck: TruckModel) => {
              truck.truck.preHireCheckList = String(truck.preHireChecklistList);
              truck.truck.noOfTrips = truck.noOfTrips;
              this.truckList.push(truck.truck);
            });
          });
      } else {
        this.service.getTruckList(this.page).subscribe((res: any) => {
          res.data.responses.forEach((truck: TruckModel) => {
            truck.truck.preHireCheckList = String(truck.preHireChecklistList);
            truck.truck.noOfTrips = truck.noOfTrips;
            this.truckList.push(truck.truck);
          });
        });
      }
    }
  }
  onMaxHeightCross($event: boolean) {
    setTimeout(() => {
      if (!$event && this.totalPages > 1 && this.page != 1) {
        this.page = 1;
        if (this.searchValue) {
          this.service
            .getTruckList(this.page, this.searchValue)
            .pipe(debounceTime(500))
            .subscribe((res: any) => {
              res.data.responses.forEach((truck: TruckModel) => {
                truck.truck.preHireCheckList = String(
                  truck.preHireChecklistList
                );
                truck.truck.noOfTrips = truck.noOfTrips;
                this.truckList.push(truck.truck);
              });
            });
        } else {
          this.service.getTruckList(this.page).subscribe((res: any) => {
            res.data.responses.forEach((truck: TruckModel) => {
              truck.truck.preHireCheckList = String(truck.preHireChecklistList);
              truck.truck.noOfTrips = truck.noOfTrips;
              this.truckList.push(truck.truck);
            });
          });
        }
      }
    }, 1);
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target.length) {
      this.searchValue = target;
    } else {
      this.searchValue = null;
    }
    this.truckList = [];
    this.page = 0;
    this.getTruckList();
  }


  onClickCheckList(truck: number) {
    this.isCheckListOpened = true;
    this.singleTruckId = truck;
  }
}
