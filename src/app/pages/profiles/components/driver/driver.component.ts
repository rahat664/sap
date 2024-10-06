import { Component, inject, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { FileUploadPopupComponent } from '../truck/file-upload-popup/file-upload-popup.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { UserModel } from '../../../user-management/models/user.model';
import { UserService } from '../../services/user.service';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { driverFileType } from '../customer/model/driver-file-type';
import { DriverEditSharedService } from '../../services/driver-edit-shared.service';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { ConfirmApproveComponent } from '../../../../shared/modules/confirm-approve/confirm-approve.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { ConfirmRejectComponent } from '../../../../shared/modules/confirm-reject/confirm-reject.component';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [
    CreatePopupComponent,
    CustomInputComponent,
    FileUploadPopupComponent,
    GetClickEventDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    RouterLink,
    UploadButtonComponent,
    LoadingComponent,
    CheckTheHeightCrossMaxHeightOrNotDirective,
    DatePipe,
    FormsModule,
    NgClass,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss',
})
export class DriverComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  isOpen: boolean;
  driverList: UserModel[] = [];
  height: string;
  loading: boolean;
  newDriverFileType: any[];
  private page: number;
  totalPages: number;
  searchValue: string;
  private size: number = 30;

  constructor(
    private user: UserService,
    private sharedService: DriverEditSharedService,
    private toastr: HandleToastrService
  ) {}

  ngOnInit(): void {
    this.onSelectStatus(0);
    this.driverList = [];
    this.getDriverList();
    this.makeSureUploadCompletedOrNot();
  }

  private getDriverList() {
    this.page = 0;
    this.loading = true;
    if (this.searchValue) {
      //subscribe with debounce time
      this.user
        .getDriver(
          this.page,
          this.size,
          this.searchValue,
          this.statusInputPlaceholder === 'All'
            ? ''
            : this.statusInputPlaceholder
        )
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.driverList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else {
      this.user
        .getDriver(
          this.page,
          this.size,
          null,
          this.statusInputPlaceholder === 'All'
            ? ''
            : this.statusInputPlaceholder
        )
        .subscribe((res: any) => {
          this.driverList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    }
  }

  onClickDriverName(driver: UserModel) {
    if (localStorage.getItem('driver')) {
      localStorage.removeItem('driver');
    }
    localStorage.setItem('driver', JSON.stringify(driver));
    this.sharedService.closeInputSelect.next(false);
  }

  driverFileType = driverFileType;
  fileArray: any[];
  isNewOpen: any;
  singleDriver: any;
  statusInputPlaceholder: any;
  filterOpened: boolean = true;
  statusOptionsArray: CustomInputSelectModel[] = [
    { id: 0, value: 'All', selected: false },
    { id: 1, value: 'Approved', selected: false },
    { id: 2, value: 'Pending', selected: false },
    { id: 3, value: 'Rejected', selected: false },
  ];

  onClickLicenseUpload(driver: UserModel) {
    this.isNewOpen = true;
    this.singleDriver = driver;
    this.isOpen = true;
    if (localStorage.getItem('driver')) {
      localStorage.removeItem('driver');
    }
    localStorage.setItem('driver', JSON.stringify(driver));
    const DFT = [];
    this.driverFileType.filter(item => {
      if (item.value?.includes('License')) {
        DFT.push(item);
      }
    });
    this.newDriverFileType = DFT;
    this.dialog.open(FileUploadPopupComponent, {
      width: '40%',
      data: {
        from: 'driver',
        filetype: this.newDriverFileType,
        value: driver,
      },
    });
  }

  onClickNidUpload(driver: UserModel) {
    this.isNewOpen = true;
    this.singleDriver = driver;
    this.isOpen = true;
    if (localStorage.getItem('driver')) {
      localStorage.removeItem('driver');
    }
    localStorage.setItem('driver', JSON.stringify(driver));
    const DFT = [];
    this.driverFileType.filter(item => {
      if (item.value?.includes('NID')) {
        DFT.push(item);
      }
    });
    this.newDriverFileType = DFT;
    this.dialog.open(FileUploadPopupComponent, {
      width: '40%',
      data: {
        from: 'driver',
        filetype: this.newDriverFileType,
        value: driver,
      },
    });
  }

  private makeSureUploadCompletedOrNot() {
    this.sharedService.completeUpload.subscribe((res: boolean) => {
      if (res) {
        this.driverList = [];
        this.getDriverList();
        this.isNewOpen = false;
        this.isOpen = false;
      }
    });
  }

  onBottom($event: boolean) {
    // if ($event && this.page < this.totalPages - 1) {
    //   this.page++;
    //   this.user.getDriver(this.page, this.size).subscribe((res: any) => {
    //     this.driverList.push(...res.data.responses);
    //   });
    // }
  }

  onMaxHeightCross($event: boolean) {
    // setTimeout(() => {
    //   if (!$event && this.totalPages > 1 && this.page != 1) {
    //     this.page = 1;
    //     this.user.getDriver(this.page).subscribe((res: any) => {
    //       this.driverList.push(...res.data.responses);
    //     });
    //   }
    // }, 1);
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target?.length > 0) {
      this.searchValue = target;
    } else {
      this.searchValue = null;
    }
    this.page = 0;
    this.driverList = [];
    this.getDriverList();
  }

  onClickClear() {
    this.searchValue = '';
    this.page = 0;
    this.driverList = [];
    this.getDriverList();
  }

  copyNumber($event: MouseEvent, createdByPhone: any) {
    $event.stopPropagation();
    this.user.copyToClipboard(createdByPhone);
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
  }

  onClearFilter() {
    this.statusOptionsArray.forEach(option => {
      option.selected = false;
    });
    this.statusInputPlaceholder = 'All';
    this.page = 0;
    this.size = 30;
    this.getDriverList();
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
    this.driverList = [];
    this.page = 0;
    this.getDriverList();
  }

  protected readonly localStorage = localStorage;

  onClickApprove(driver: UserModel) {
    this.dialog
      .open(ConfirmApproveComponent, {
        data: {
          title: 'Approve',
          text: `${driver.userId}?`,
          buttonText: 'Approve',
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res === 'updated') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['driverId'] = driver.userId;
          payload['driverName'] = driver.name;
          payload['driverPhone'] = driver.phone;
          payload['driverStatus'] = 'Approved';
          formData.append('payload', JSON.stringify(payload));
          this.user.editDriver(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
                this.toastr.showSuccess(res.message);
                this.driverList = [];
                this.getDriverList();
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

  onClickReject(driver: UserModel) {
    this.dialog
      .open(ConfirmRejectComponent, {
        data: {
          title: 'Reject',
          text: `${driver.userId}?`,
          buttonText: 'Reject',
        },
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res.status === 'rejected') {
          // Do something
          const formData = new FormData();
          const payload: Record<string, any> = {};
          payload['driverId'] = driver.userId;
          payload['driverName'] = driver.name;
          payload['driverPhone'] = driver.phone;
          payload['driverStatus'] = 'Rejected';
          payload['rejectedReason'] = res.reason;
          formData.append('payload', JSON.stringify(payload));
          this.user.editDriver(formData).subscribe(
            (res: any) => {
              // Handle response
              if (res.status == 'OK') {
                this.toastr.showSuccess(res.message);
                this.driverList = [];
                this.getDriverList();
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

  getBgColor(status: string) {
    if (status === 'Approved') {
      return 'bg-green';
    } else if (status === 'Pending') {
      return 'bg-another';
    } else {
      return 'bg-red';
    }
  }
}
