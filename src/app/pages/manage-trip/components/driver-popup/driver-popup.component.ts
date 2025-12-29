import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
  takeUntil,
  timer,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-driver-popup',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './driver-popup.component.html',
  styleUrl: './driver-popup.component.scss',
})
export class DriverPopupComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  private totalPages: number;
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

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
    this.searchInput$
      .pipe(
        map(value => (value || '').trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.page = 0;
        this.size = 20;
        this.loading = true;
        this.searchValue = value;
        this.driverList = [];
        this.getDriverList();
      });
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
    this.destroy$.next();
    this.destroy$.complete();
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
    this.searchInput$.next(($event.target as HTMLInputElement).value || '');
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
    const atBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10; // Small buffer

    if (atBottom) {
      this.loadMoreData();
    }
  }

  loadMoreData() {
    if (this.page > this.totalPages - 1) return;
    this.page++;

    this.user
      .getDriver(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.driverList.push(...res.data.responses);
        this.totalPages = res.data.totalPages;
      });
  }

  informParent() {
    this.dialogRef.close('Driver Popup Triggered')
  }
}
