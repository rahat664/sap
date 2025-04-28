import { Component, inject, OnInit } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { CustomerCreateComponent } from '../customer/customer-create/customer-create.component';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { UserModel } from '../../../user-management/models/user.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { DateEnum } from '../../../trip-list/Enum/date.enum';
import { DriverEditSharedService } from '../../services/driver-edit-shared.service';
import { CustomInputSelectModel } from '../../../../shared/modules/custom-input/custom-input-select.model';
import { UserFilterComponent } from '../../../user-management/user-filter/user-filter.component';
import { TransporterFilterComponent } from './transporter-filter/transporter-filter.component';

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
    CustomInputComponent,
    NgClass,
    GetClickEventDirective,
    UserFilterComponent,
    TransporterFilterComponent,
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
  from: string;
  to: string;
  filterForm: FormGroup;
  inputPlaceholder: string = '';
  isDateOpened: boolean;
  filterData: any = {};

  constructor(
    private service: UserService,
    private router: Router,
    private shared: DriverEditSharedService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
  }

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
    localStorage.removeItem('tripFilterData');
    this.page = 0;
    this.size = 20;
    this.generateDateOptionsArray();
    this.getTransporterList();
  }

  private getTransporterList() {
    this.loading = true;
    if (this.searchValue) {
      this.service
        .getTransporter(
          this.page,
          this.size,
          this.searchValue,
          this.from,
          this.to
        )
        .pipe(debounceTime(1000))
        .subscribe((res: any) => {
          this.transporterList = res.data;
          this.totalPages = res.meta.totalPageCount;
          this.loading = false;
        });
    } else {
      this.service
        .getTransporter(this.page, this.size, null, this.from, this.to)
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

  protected readonly Math = Math;
  filterOpened: boolean = false;
  dateFilter: number = 0;
  dateOpened: boolean;
  dateOptionArray: CustomInputSelectModel[];
  filterApplied: boolean = false;

  copyNumber($event, createdByPhone: string) {
    $event.stopPropagation();
    // remove first 3 characters from the phone number
    const phone = createdByPhone.slice(3);
    // copy the phone number to the clipboard
    this.service.copyToClipboard(phone);
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
  }

  onClearFilter() {
    this.filterForm.reset();
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.getTransporterList();
  }

  private generateDateOptionsArray() {
    this.dateOptionArray = [
      { id: DateEnum.Today, value: 'Today', selected: false },
      { id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false },
      { id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false },
      { id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false },
      { id: DateEnum.Custom, value: 'Custom', selected: false },
    ];
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
    this.getTransporterList();
  }
  onSelectDate($event: number) {
    this.dateFilter = 1;
    if ($event === DateEnum.Custom) {
      this.shared.closeInputSelect.next(true);
    } else {
      this.shared.closeInputSelect.next(false);
      this.inputPlaceholder =
        this.dateOptionArray.find(x => x.id === $event)?.value || '';
      this.dateOptionArray.forEach(x => (x.selected = x.id === $event));
      this.setDateRange($event);
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getTransporterList();
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

  onCLickClearAll() {
    localStorage.removeItem('tripFilterData');
    this.filterForm.reset();
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.getTransporterList();
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

    return parts.join(', ');
  }

  onFilterApply() {
    if (this.filterData?.startDate || this.filterData?.endDate) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.from = this.filterData.startDate;
      this.to = this.filterData.endDate;
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getTransporterList();
    } else {
      localStorage.removeItem('tripFilterData');
      this.filterApplied = false;
      this.loading = true;
      this.page = 0;
      this.size = 30;
      this.from = '';
      this.to = '';
      this.filterForm.reset();
      this.getTransporterList();
    }
  }

  onFilterData($event: any) {
    this.filterData = $event;
  }
}
