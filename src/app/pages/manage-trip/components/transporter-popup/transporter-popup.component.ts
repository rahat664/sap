import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import { debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-transporter-popup',
  imports: [
    CommonModule,
    GiveMaxHeightDirective,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './transporter-popup.component.html',
  styleUrl: './transporter-popup.component.scss',
})
export class TransporterPopupComponent implements OnInit {
  private totalPages: number;

  constructor(
    private user: UserService,
    public dialogRef: MatDialogRef<TransporterPopupComponent>
  ) {}

  transporterList: any[] = [];
  loading: boolean;
  page = 0;
  size = 20;
  searchValue: any;

  closeDialog() {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.loading = true;
    this.transporterList = [];
    this.getTransporterList();
  }

  private getTransporterList() {
    this.user
      .getTransporter(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.transporterList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.user
        .getTransporter(this.page, this.size, this.searchValue)
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.transporterList.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
        });
    }
  }

  onSelectTransporter(transporter: any) {
    this.dialogRef.close(transporter);
  }

  onClickClear() {
    this.searchValue = '';
    this.transporterList = [];
    this.getTransporterList();
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target?.length) {
      this.searchValue = target;
    } else {
      this.searchValue = '';
    }
    this.transporterList = [];
    this.getTransporterList();
  }
}
