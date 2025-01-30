import { Component, inject, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import {
  DatePipe,
  NgClass,
  NgForOf,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransporterAddComponent } from '../transporter/transporter-add/transporter-add.component';
import { TruckService } from './services/truck.service';
import { Router, RouterLink } from '@angular/router';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { FileUploadPopupComponent } from './file-upload-popup/file-upload-popup.component';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { DriverEditSharedService } from '../../services/driver-edit-shared.service';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { debounceTime } from 'rxjs';
import { CheckListPopupComponent } from '../../../../shared/modal/check-list-popup/check-list-popup.component';
import { PreHireChecklistComponent } from './pre-hire-checklist/pre-hire-checklist.component';
import { MatDialog } from '@angular/material/dialog';
import { TruckDocument, TruckModel } from './models/truck.model';
import { TruckDocumentType } from '../../../../shared/Enums/registration_type';
import { ConfirmRejectComponent } from '../../../../shared/modules/confirm-reject/confirm-reject.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { ConfirmApproveComponent } from '../../../../shared/modules/confirm-approve/confirm-approve.component';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { PreHireChecklistPopupComponent } from './pre-hire-checklist-popup/pre-hire-checklist-popup.component';

@Component({
  selector: 'app-truck',
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    UploadButtonComponent,
    LoadingComponent,
    DatePipe,
    FormsModule,
    MatMenuTrigger,
    MatMenu,
    NgClass,
    MatMenuItem,
    MatButton,
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
  isCheckListOpened = false;
  singleTruckId: number;
  size = 30;
  truckEnum = TruckDocumentType;
  firstColumnHeight: any;
  filterOpened = true;
  statusInputPlaceholder: string;
  statusOptionsArray: CustomInputSelectModel[] = [
    { id: 0, value: 'All', selected: false },
    { id: 1, value: 'Approved', selected: false },
    { id: 2, value: 'Pending', selected: false },
    { id: 3, value: 'Rejected', selected: false },
  ];

  constructor(
    private service: TruckService,
    private toastr: HandleToastrService,
    private shared: DriverEditSharedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.truckList = [];
    this.getTruckList();
    this.makeSureUploadCompletedOrNot();
    this.onSelectStatus(0);
  }

  private getTruckList() {
    this.page = 0;
    this.loading = true;
    if (this.searchValue) {
      //subscribe with debounced time
      this.service
        .getTruckList(this.page, this.size, this.searchValue)
        .pipe(debounceTime(1000))
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

    if (fit == 'insurance') {
      this.newDriverFileType = [{ id: 7, value: 'Insurance', selected: false }];
    }

    this.dialog.open(FileUploadPopupComponent, {
      width: '40%',
      data: {
        filetype: this.newDriverFileType,
        fromPopup: true,
        from: 'truck',
        value: truck,
      },
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
          .getTruckList(
            this.page,
            this.size,
            this.searchValue,
            this.statusInputPlaceholder == 'All'
              ? ''
              : this.statusInputPlaceholder
          )
          .pipe(debounceTime(1000))
          .subscribe((res: any) => {
            this.truckList.push(...res.data.responses);
          });
      } else {
        this.service
          .getTruckList(
            this.page,
            this.size,
            null,
            this.statusInputPlaceholder == 'All'
              ? ''
              : this.statusInputPlaceholder
          )
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
    this.service.getPreHireChecklist(truck.id).subscribe((res: any) => {
      this.dialog
        .open(PreHireChecklistPopupComponent, {
          width: '40%',
          data: {
            checklist: res.data,
            truck: truck,
            checked: res.data.filter((x: any) => x.status === 'PASS').length,
          },
        })
        .afterClosed()
        .subscribe((res: any) => {
          if (res) {
            this.editPreHireChecklist(res);
          }
        });
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
    let expDate = '';
    truckDocumentList.forEach(doc => {
      if (doc.documentType == this.truckEnum[fileName]) {
        isExist = true;
        expDate = doc?.expiryDate;
      }
    });
    return {
      isExist: isExist,
      expDate: expDate,
    };
  }

  checkExpiryDate(expDate: string) {
    if (expDate) {
      const today = new Date();
      const expiryDate = new Date(expDate);
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      if (today > expiryDate) {
        return true;
      }
    }
    return false;
  }

  getBgColor(status: string) {
    if (status === 'Approved') {
      return 'bg-green';
    } else if (status === 'Pending') {
      return 'bg-another';
    } else {
      return 'bg-red';
    }
  }

  onClickApprove(truckDetails: TruckModel) {
    this.dialog
      .open(ConfirmApproveComponent, {
        data: {
          title: 'Attention',
          textPrefix: 'the truck with registration number ',
          text: `${truckDetails.fullRegistrationNumber}?`,
          buttonText: 'Approve',
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res === 'updated') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['id'] = truckDetails.id;
          payload['status'] = 'Approved';
          formData.append('payload', JSON.stringify(payload));
          this.service.editTruck(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
                this.toastr.showSuccess(res.message);
                this.truckList = [];
                this.getTruckList();
              } else {
                this.toastr.showError(res.message);
              }
            },
            error => {
              // Handle error
              this.toastr.showError(error.error.message);
            }
          );
        }
      });
  }

  onClickGenerateReport() {
    this.router.navigateByUrl('/profile/truck/report');
  }

  onClickReject(truckDetails: TruckModel) {
    this.dialog
      .open(ConfirmRejectComponent, {
        data: {
          title: 'Attention',
          textPrefix: 'the truck with registration number ',
          text: `${truckDetails.fullRegistrationNumber}?`,
          buttonText: 'Reject',
          reasonAvailable: true,
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res.status === 'rejected') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['id'] = truckDetails.id;
          payload['status'] = 'Rejected';
          payload['rejectedReason'] = res.reason;
          formData.append('payload', JSON.stringify(payload));
          this.service.editTruck(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
                this.toastr.showSuccess(res.message);
                this.truckList = [];
                this.getTruckList();
              } else {
                this.toastr.showError(res.message);
              }
            },
            error => {
              // Handle error
              this.toastr.showError(error.error.message);
            }
          );
        }
      });
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
  }

  onClearFilter() {
    this.statusOptionsArray.forEach(option => {
      option.selected = false;
    });
    this.statusInputPlaceholder = '';
    this.page = 0;
    this.size = 30;
    this.getTruckList();
  }

  onSelectStatus($event: number) {
    this.statusOptionsArray.forEach(option => {
      if (option.id === $event) {
        option.selected = !option.selected;
        if (option.selected && option.value !== 'All') {
          this.statusInputPlaceholder = option.value;
        } else {
          this.statusInputPlaceholder = 'All';
        }
      } else {
        option.selected = false;
      }
    });
    this.truckList = [];
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.service
      .getTruckList(
        this.page,
        this.size,
        null,
        this.statusInputPlaceholder == 'All' ? '' : this.statusInputPlaceholder
      )
      .subscribe((res: any) => {
        this.truckList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }
  private editPreHireChecklist(res: any) {
    const formData = new FormData();
    const payload: Record<string, any> = {};
    payload['id'] = this.singleTruckId;
    payload['checklist'] = res;
    formData.append('payload', JSON.stringify(payload));
    this.service.editTruck(formData).subscribe(
      (res: any) => {
        // Handle response
        if (res.status == 'OK') {
          this.toastr.showSuccess('Checklist updated successfully');
          this.truckList = [];
          this.getTruckList();
        } else {
          this.toastr.showError(res.message);
        }
      },
      error => {
        // Handle error
        this.toastr.showError(error.error.message);
      }
    );
  }
  protected readonly localStorage = localStorage;
}
