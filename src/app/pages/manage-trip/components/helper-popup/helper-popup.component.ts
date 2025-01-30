import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import { debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-helper-popup',
  imports: [
    CommonModule,
    GiveMaxHeightDirective,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './helper-popup.component.html',
  styleUrl: './helper-popup.component.scss',
})
export class HelperPopupComponent implements OnInit, OnDestroy {
  private totalPages: number;

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
    this.loading = true;
    this.helperList = [];
    this.getHelperList();
  }

  ngOnDestroy() {
    this.helperList = [];
    this.page = 0;
    this.size = 20;
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

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.user
        .getHelpers(this.page, this.size, this.searchValue)
        .pipe(debounceTime(1000))
        .subscribe((res: any) => {
          this.helperList.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
        });
    }
  }

  onSelectHelper(helper: any) {
    this.dialogRef.close(helper);
  }

  onClickClear() {
    this.searchValue = '';
    this.helperList = [];
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
    this.helperList = [];
    this.getHelperList();
  }
}
