import { Component, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { FileUploadPopupComponent } from '../truck/file-upload-popup/file-upload-popup.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { UserModel } from '../../../user-management/models/user.model';
import { UserService } from '../../services/user.service';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { driverFileType } from '../customer/model/driver-file-type';
import { DriverEditSharedService } from '../../services/driver-edit-shared.service';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { debounceTime } from 'rxjs';

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
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss',
})
export class DriverComponent implements OnInit {
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
    private sharedService: DriverEditSharedService
  ) {}

  ngOnInit(): void {
    this.getDriverList();
    this.makeSureUploadCompletedOrNot();
  }

  private getDriverList() {
    this.page = 0;
    this.loading = true;
    if (this.searchValue) {
      //subscribe with debounce time
      this.user
        .getDriver(this.page, this.size, this.searchValue)
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.driverList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else {
      this.user.getDriver(this.page, this.size).subscribe((res: any) => {
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
  }

  driverFileType = driverFileType;
  fileArray: any[];
  isNewOpen: any;
  singleDriver: any;

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
}
