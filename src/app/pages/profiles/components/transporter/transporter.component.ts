import { Component, inject, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomerCreateComponent } from '../customer/customer-create/customer-create.component';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UserModel } from '../../../user-management/models/user.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { UserService } from '../../services/user.service';
import { TransporterAddComponent } from './transporter-add/transporter-add.component';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { debounceTime } from 'rxjs';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { MatDialog } from '@angular/material/dialog';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-transporter',
  imports: [
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent,
    DatePipe,
    numberPipe,
    RouterLink,
  ],
  templateUrl: './transporter.component.html',
  styleUrl: './transporter.component.scss',
})
export class TransporterComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  height = '';
  isOpen: boolean;
  transporterList: UserModel[] = [];
  loading: boolean;
  searchValue: string;
  page = 0;
  totalPages: number;
  size = 20;

  constructor(private service: UserService, private router: Router) {}

  onClickAddTransporter() {
    this.router.navigate(['/profile/transporter/add']);
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.page = 0;
    this.size = 20;
    const value = ($event.target as HTMLInputElement).value;
    if (value?.length > 0) {
      this.searchValue = value;
    } else {
      this.searchValue = '';
    }
    this.transporterList = [];
    this.getTransporterList();
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      if (this.searchValue) {
        this.service
          .getTransporter(this.page, this.size, this.searchValue)
          .pipe(debounceTime(1000))
          .subscribe((res: any) => {
            this.transporterList.push(...res.data);
          });
      } else {
        this.service
          .getTransporter(this.page, this.size)
          .subscribe((res: any) => {
            this.transporterList.push(...res.data);
          });
      }
    }
  }

  ngOnInit(): void {
    this.page = 0;
    this.size = 20;
    this.getTransporterList();
  }

  private getTransporterList() {
    this.loading = true;
    if (this.searchValue) {
      this.service
        .getTransporter(this.page, this.size, this.searchValue)
        .pipe(debounceTime(1000))
        .subscribe((res: any) => {
          this.transporterList = res.data;
          this.totalPages = res.meta.totalPageCount;
          this.loading = false;
        });
    } else {
      this.service
        .getTransporter(this.page, this.size)
        .subscribe((res: any) => {
          this.transporterList = res.data;
          this.totalPages = res.meta.totalPageCount;
          this.loading = false;
        });
    }
  }

  onClickTransporter($event: boolean) {
    this.page = 0;
    this.isOpen = !$event;
    this.transporterList = [];
    this.getTransporterList();
  }

  onClickClear() {
    this.searchValue = '';
    this.page = 0;
    this.transporterList = [];
    this.getTransporterList();
  }

  copyNumber($event, createdByPhone: string) {
    $event.stopPropagation();
    // remove first 3 characters from the phone number
    const phone = createdByPhone.slice(3);
    // copy the phone number to the clipboard
    this.service.copyToClipboard(phone);
  }

  protected readonly Math = Math;
}
