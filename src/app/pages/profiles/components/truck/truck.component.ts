import { Component, inject, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

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
    DatePipe,
    FormsModule,
    NgClass,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './truck.component.html',
  styleUrl: './truck.component.scss',
})
export class TruckComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  height = '';
  truckList: TruckModel[] = [];
  isOpen = false;
  loading: boolean;
  singleTruck: TruckModel;
  newDriverFileType: CustomInputSelectModel[] = [];
  private page = 0;
  totalPages: number;
  searchValue: string;
  isCheckListOpened: boolean = false;
  singleTruckId: number;
  size: number = 30;
  truckEnum = TruckDocumentType;
  firstColumnHeight: any;

  constructor(
    private service: TruckService,
    private shared: DriverEditSharedService
  ) {}

  ngOnInit(): void {
    this.truckList = [];
    this.getTruckList();
    this.makeSureUploadCompletedOrNot();
  }

  private getTruckList() {
    this.page = 0;
    this.loading = true;
    if (this.searchValue) {
      //subscribe with debounced time
      this.service
        .getTruckList(this.page, this.size, this.searchValue)
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.truckList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else {
      this.service.getTruckList(this.page, this.size).subscribe((res: any) => {
        this.truckList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
    }
  }

  getFullRegistrationName(truck: TruckModel) {
    return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial}-${truck.registrationNum}`;
  }

  onClickTruckDetails(truck: TruckModel) {
    localStorage.removeItem('truck');
    localStorage.setItem('truck', JSON.stringify(truck));
    this.shared.closeInputSelect.next(false);
  }

  onClickUpdate(fit: string, truck: TruckModel) {
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

    this.dialog
      .open(FileUploadPopupComponent, {
        width: '40%',
        data: {
          filetype: this.newDriverFileType,
          fromPopup: true,
          from: 'truck',
          value: truck,
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res) {
        }
      });
  }

  private makeSureUploadCompletedOrNot() {
    this.shared.completeTruckUpload.subscribe((res: boolean) => {
      if (res) {
        this.isOpen = false;
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
          .getTruckList(this.page, this.size, this.searchValue)
          .pipe(debounceTime(500))
          .subscribe((res: any) => {
            this.truckList.push(...res.data.responses);
          });
      } else {
        this.service
          .getTruckList(this.page, this.size)
          .subscribe((res: any) => {
            this.truckList.push(...res.data.responses);
          });
      }
    }
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target?.length) {
      this.searchValue = target;
    } else {
      this.searchValue = null;
    }
    this.truckList = [];
    this.page = 0;
    this.getTruckList();
  }

  onClickCheckList(truck) {
    this.isCheckListOpened = true;
    this.singleTruckId = truck.id;
    localStorage.removeItem('truck');
    localStorage.setItem('truck', JSON.stringify(truck));
    this.dialog.open(PreHireChecklistComponent, {
      width: '40%',
    });
  }

  onClickAddTruck() {
    this.shared.closeInputSelect.next(false);
  }

  onClickClear() {
    this.searchValue = '';
    this.truckList = [];
    this.page = 0;
    this.getTruckList();
  }

  checkThatFileIsExistOrNot(fileName: any, truckDocumentList: TruckDocument[]) {
    let isExist = false;
    truckDocumentList.forEach(doc => {
      if (doc.documentType == this.truckEnum[fileName]) {
        isExist = true;
      }
    });
    return isExist;
  }

  checkExpiryDate(fitnessCertExpDate: string) {
    if (fitnessCertExpDate) {
      const today = new Date();
      const expiryDate = new Date(fitnessCertExpDate);
      if (today > expiryDate) {
        return true;
      }
    }
    return false;
  }
}
