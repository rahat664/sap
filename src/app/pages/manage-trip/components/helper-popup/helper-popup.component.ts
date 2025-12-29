import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-helper-popup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './helper-popup.component.html',
  styleUrl: './helper-popup.component.scss',
})
export class HelperPopupComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  private totalPages: number;
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private user: UserService,
    public dialogRef: MatDialogRef<HelperPopupComponent>
  ) {}

  helperList: any[] = [];
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
    this.helperList = [];
    this.getHelperList();
    this.searchInput$
      .pipe(
        map(value => (value || '').trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.loading = true;
        this.page = 0;
        this.size = 20;
        this.searchValue = value;
        this.helperList = [];
        this.getHelperList();
      });
  }

  ngOnDestroy() {
    this.helperList = [];
    this.page = 0;
    this.size = 20;
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getHelperList() {
    this.user
      .getHelpers(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.helperList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }

  onSelectHelper(helper: any) {
    this.dialogRef.close(helper);
  }

  onClickClear() {
    this.page = 0;
    this.size = 20;
    this.searchValue = '';
    this.helperList = [];
    this.getHelperList();
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.searchInput$.next(($event.target as HTMLInputElement).value || '');
  }
}
