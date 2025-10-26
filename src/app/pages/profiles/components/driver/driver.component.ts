import { Component, inject, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { FileUploadPopupComponent } from '../truck/file-upload-popup/file-upload-popup.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { UserModel } from '../../../user-management/models/user.model';
import { UserService } from '../../services/user.service';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { driverFileType } from '../customer/model/driver-file-type';
import { DriverEditSharedService } from '../../services/driver-edit-shared.service';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { debounceTime } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { ConfirmApproveComponent } from '../../../../shared/modules/confirm-approve/confirm-approve.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { ConfirmRejectComponent } from '../../../../shared/modules/confirm-reject/confirm-reject.component';
import {
  DriverDocumentType,
  TruckDocumentType,
} from '../../../../shared/Enums/registration_type';
import { DateEnum } from '../../../trip-list/Enum/date.enum';
import { TruckFilterComponent } from '../truck/truck-filter/truck-filter.component';
import { DriverFilterComponent } from './driver-filter/driver-filter.component';
import { TripData } from '../../../manage-trip/model/trip.details.model';
import { SessionModel } from '../../../manage-bid/models/session.model';

@Component({
  selector: 'app-driver',
  imports: [
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    RouterLink,
    UploadButtonComponent,
    LoadingComponent,
    DatePipe,
    FormsModule,
    NgClass,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    DriverFilterComponent,
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
  private page: number = 0;
  totalPages: number;
  searchValue: string;
  private size = 30;
  dateFilter: number = 0;
  private from: any;
  private to: any;
  filterForm: FormGroup;
  isDateOpened: boolean;
  filterApplied: boolean = false;
  filterData: any = {};
  hasDocument: boolean = true;

  constructor(
    private user: UserService,
    private sharedService: DriverEditSharedService,
    private toastr: HandleToastrService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.generateDateOptionsArray();
    this.driverList = [];
    this.getDriverListFromResolver();
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
            : this.statusInputPlaceholder,
          this.from,
          this.to,
          this.hasDocument
        )
        .pipe(debounceTime(1000))
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
            : this.statusInputPlaceholder,
          this.from,
          this.to,
          this.hasDocument
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
  filterOpened = false;
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
      width: this.isMobileDevice() ? '90%' : '40%',
      data: {
        from: 'driver',
        filetype: this.newDriverFileType,
        value: driver,
      },
    });
  }

  isMobileDevice() {
    return localStorage.getItem('isMobileDevice') === 'true';
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
      width: this.isMobileDevice() ? '90%' : '40%',
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
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.user
        .getDriver(
          this.page,
          this.size,
          null,
          this.statusInputPlaceholder === 'All'
            ? ''
            : this.statusInputPlaceholder,
          this.from,
          this.to
        )
        .subscribe((res: any) => {
          this.driverList.push(...res.data.responses);
        });
    }
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

  copyNumber($event, createdByPhone: string) {
    $event.stopPropagation();
    // remove first 3 characters from the phone number
    const phone = createdByPhone.slice(3);
    // copy the phone number to the clipboard
    this.user.copyToClipboard(phone);
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
  }

  onClearFilter() {
    this.statusOptionsArray.forEach(option => {
      option.selected = false;
    });
    this.dateFilter = 0;
    this.from = '';
    this.to = '';
    this.filterForm.get('startDate')?.setValue('');
    this.filterForm.get('endDate')?.setValue('');
    this.inputPlaceholder = '';
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
          title: 'Attention',
          textPrefix: 'the driver ',
          text: `${driver.name} (${driver.phone})?`,
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
          title: 'Attention',
          textPrefix: 'the driver ',
          text: ` ${driver.name} (${driver.phone})?`,
          reasonAvailable: true,
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

  protected readonly driverEnum = DriverDocumentType;

  checkThatFileIsExistOrNot(fileName: any, truckDocumentList: any[]) {
    let isExist = false;
    let expDate = '';
    truckDocumentList?.forEach(doc => {
      if (doc.documentType == this.driverEnum[fileName]) {
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

  protected readonly truckEnum = TruckDocumentType;
  dateOpened: boolean;
  inputPlaceholder: string;
  dateOptionArray: CustomInputSelectModel[];

  private generateDateOptionsArray() {
    this.dateOptionArray = [
      { id: DateEnum.Today, value: 'Today', selected: false },
      { id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false },
      { id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false },
      { id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false },
      { id: DateEnum.Custom, value: 'Custom', selected: false },
    ];
  }

  onClickOther(other: string, driver: UserModel) {
    this.singleDriver = driver;
    this.isOpen = true;
    if (localStorage.getItem('driver')) {
      localStorage.removeItem('driver');
    }
    localStorage.setItem('driver', JSON.stringify(driver));
    const DFT = [];
    this.driverFileType.filter(item => {
      if (item.value?.includes('Other')) {
        DFT.push(item);
      }
    });
    this.newDriverFileType = DFT;
    this.dialog.open(FileUploadPopupComponent, {
      width: this.isMobileDevice() ? '90%' : '40%',
      data: {
        from: 'driver',
        filetype: this.newDriverFileType,
        value: driver,
      },
    });
  }

  onSelectedFromDate($event: string) {
    this.filterForm.get('startDate')?.setValue($event);
  }

  onSelectedToDate($event: string) {
    this.filterForm.get('endDate')?.setValue($event);
    this.from = this.filterForm.get('startDate')?.value || '';
    this.to = this.filterForm.get('endDate')?.value || '';
    this.dateOpened = false;
    this.isDateOpened = false;
    this.page = 0;
    this.size = 30;
    this.getDriverList();
  }

  onSelectDate($event: number) {
    this.dateFilter = 1;
    if ($event === DateEnum.Custom) {
      this.sharedService.closeInputSelect.next(true);
    } else {
      this.sharedService.closeInputSelect.next(false);
      this.inputPlaceholder =
        this.dateOptionArray.find(x => x.id === $event)?.value || '';
      this.dateOptionArray.forEach(x => (x.selected = x.id === $event));
      this.setDateRange($event);
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getDriverList();
    }
  }

  private setDateRange(dateEnum: DateEnum) {
    const fromDate = new Date();
    // to date should be yesterday
    const toDate = new Date();
    switch (dateEnum) {
      case DateEnum.Today:
        fromDate.setDate(fromDate.getDate());
        toDate.setDate(toDate.getDate());
        break;
      case DateEnum.LastSevenDays:
        // shouldn't be count today
        fromDate.setDate(fromDate.getDate() - 7);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.LastFifteenDays:
        fromDate.setDate(fromDate.getDate() - 15);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.LastThirtyDays:
        fromDate.setDate(fromDate.getDate() - 30);
        toDate.setDate(toDate.getDate() - 1);
        break;
    }
    this.from = this.datePipe.transform(fromDate, 'yyyy-MM-dd') || '';
    this.to = this.datePipe.transform(toDate, 'yyyy-MM-dd') || '';
  }

  onClickFilterOpen() {
    this.filterOpened = true;
  }

  get filterSummary(): string {
    const parts: string[] = [];
    if (this.filterData.startDate)
      parts.push(
        `From: <b>${this.datePipe.transform(this.filterData.startDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.endDate)
      parts.push(
        `To: <b>${this.datePipe.transform(this.filterData.endDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.statusInputPlaceholder)
      parts.push(
        `Driver Status: <b>${this.filterData.statusInputPlaceholder}</b>`
      );
    if (this.hasDocument || this.filterData?.hasDocument)
      parts.push(
        `Has Document: <b>${this.hasDocument ? 'Yes' : 'No'}</b>`
      );

    return parts.join(', ');
  }

  onFilterApply() {
    if (
      this.filterData?.startDate ||
      this.filterData?.endDate ||
      this.filterData?.statusInputPlaceholder || this.filterData?.hasDocument
    ) {
      this.hasDocument = this.filterData?.hasDocument === 'Yes';
      this.filterApplied = true;
      this.filterOpened = false;
      this.from = this.filterData.startDate;
      this.to = this.filterData.endDate;
      this.statusInputPlaceholder = this.filterData.statusInputPlaceholder;
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getDriverList();
    } else {
      localStorage.removeItem('tripFilterData');
      this.filterApplied = false;
      this.hasDocument = true
      this.loading = true;
      this.page = 0;
      this.size = 30;
      this.from = '';
      this.to = '';
      this.statusInputPlaceholder = '';
      this.filterForm.reset();
      this.getDriverList();
    }
  }

  onCLickClearAll() {
    localStorage.removeItem('tripFilterData');
    this.filterForm.reset();
    this.filterApplied = false;
    this.filterData = {};
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.hasDocument = true
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.statusInputPlaceholder = '';
    this.getDriverList();
  }

  onFilterData($event: any) {
    this.filterData = $event;
  }

  private getDriverListFromResolver() {
    this.activatedRoute.data.subscribe((data: any) => {
      const res = data.driver.data
      this.driverList = res.data.responses;
      this.totalPages = res.data.totalPages;
      this.loading = false;
    })
  }
}
