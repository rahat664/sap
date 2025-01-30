import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import { debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-driver-popup',
  imports: [
    CommonModule,
    GiveMaxHeightDirective,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './driver-popup.component.html',
  styleUrl: './driver-popup.component.scss',
})
export class DriverPopupComponent implements OnInit, OnDestroy {
  private totalPages: number;

  constructor(
    private user: UserService,
    public dialogRef: MatDialogRef<DriverPopupComponent>
  ) {}

  driverList: any[] = [];
  loading: boolean;
  page = 0;
  size = 20;
  searchValue: any;

  closeDialog() {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.loading = true;
    this.driverList = [];
    this.getHelperList();
  }

  private getHelperList() {
    this.user
      .getDriver(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.driverList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.user
        .getDriver(this.page, this.size, this.searchValue)
        .pipe(debounceTime(1000))
        .subscribe((res: any) => {
          this.driverList.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
        });
    }
  }

  ngOnDestroy() {
    this.driverList = [];
    this.page = 0;
    this.size = 20;
  }

  onSelectDriver(driver) {
    this.dialogRef.close(driver);
  }

  onClickClear() {
    this.searchValue = '';
    this.driverList = [];
    this.getHelperList();
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target?.length) {
      this.searchValue = target;
    } else {
      this.searchValue = '';
    }
    this.driverList = [];
    this.getHelperList();
  }
}
