import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import { debounceTime, timer } from 'rxjs';
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
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
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
    this.page = 0;
    this.size = 20;
    this.loading = true;
    this.driverList = [];
    this.getDriverList();
  }


  private getDriverList() {
    this.user
      .getDriver(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.driverList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
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
    this.page = 0;
    this.size = 20;
    this.searchValue = '';
    this.driverList = [];
    this.getDriverList();
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.page = 0;
    this.size = 20;
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target?.length) {
      this.searchValue = target;
    } else {
      this.searchValue = '';
    }
    this.driverList = [];
    this.getDriverList()
  }

  ngAfterViewInit() {
    this.implementScrollToLoadMoreData();
  }

  private implementScrollToLoadMoreData() {
    timer(1000).subscribe(() => {
      // implement scroll event
      this.myScrollContainer.nativeElement.style.height = '100%';
      this.myScrollContainer.nativeElement.style.minHeight = '100%';
      this.myScrollContainer.nativeElement.style.overflow = 'auto';

      this.myScrollContainer.nativeElement.addEventListener('scroll', () => {
        this.checkIfScrollAtBottom();
      });
    });
  }

  checkIfScrollAtBottom() {
    const container = this.myScrollContainer.nativeElement;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10; // Small buffer

    if (atBottom) {
      this.loadMoreData();
    }
  }

  loadMoreData() {
    if (this.page > this.totalPages - 1) return;
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
