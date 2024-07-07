import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TripService } from './services/trip.service';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { DateEnum } from './Enum/date.enum';
import { CustomInputSelectModel } from '../../shared/modules/custom-input/custom-input-select.model';
import { ButtonChipsComponent } from './modules/button-chips/button-chips.component';
import { ScrollByButtonDirective } from '../../shared/directive/scroll-by-button.directive';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { GetClickEventDirective } from '../../shared/directive/get-click-event.directive';
import { statusButtons } from './models/status-buttons';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
import { CustomerService } from '../profiles/services/customer.service';
import { GetOutsideModalClickDirective } from '../../shared/directive/get-outside-modal-click.directive';
import { Trip } from '../auth/models/response/trip';
import { CheckTheHeightCrossMaxHeightOrNotDirective } from '../../shared/directive/check-the-height-cross-max-height-or-not.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    ReactiveFormsModule,
    NgSelectModule,
    NgForOf,
    DatePipe,
    CustomInputComponent,
    FormsModule,
    ButtonChipsComponent,
    ScrollByButtonDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    GetClickEventDirective,
    LoadingComponent,
    GetOutsideModalClickDirective,
    CheckTheHeightCrossMaxHeightOrNotDirective,
    RouterLink,
  ],
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent implements OnInit {
  filterOpened = false;
  filterForm: FormGroup;
  isDateOpened = false;
  tripList: Trip[] = [];
  inputPlaceholder = '';
  dateOptionArray: CustomInputSelectModel[] = [];
  searchValue = '';
  from = '';
  to = '';
  status = '';
  tripSuggestions: any[] = [];
  isSearchedMenuOpened = false;
  searchName = '';
  dateFilter = 0;
  searchFilter = 0;
  summary = {
    trips: 0,
    trs: 0,
    crs: 0,
    gps: 0,
  };
  statusButtons = statusButtons;
  rightButtonClicked = false;
  leftButtonClicked = false;
  right = '0px';
  height = '0px';
  scrollable = true;
  dateOpened = false;
  loading = false;
  page = 0;
  totalPages = 0;
  tripId: string = '';
  isTripSearchedMenuOpened: boolean = false;
  tripIdSuggestions: any[] = [];
  tripFilter: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private service: TripService,
    private datePipe: DatePipe,
    private customer: CustomerService
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.page = 0;
    this.getTripList();
    this.generateDateOptionsArray();
  }

  private getTripList() {
    this.service
      .getTrips(
        this.page,
        null,
        this.searchValue,
        this.from,
        this.to,
        this.status,
        this.tripId
      )
      .subscribe((trip: any) => {
        this.updateTripList(trip);
      });
  }

  onSelectDate($event: number) {
    this.dateFilter = 1;
    if ($event === DateEnum.Custom) {
      this.isDateOpened = true;
      this.dateOpened = true;
    } else {
      this.isDateOpened = false;
      this.dateOpened = false;
      this.inputPlaceholder =
        this.dateOptionArray.find(x => x.id === $event)?.value || '';
      this.dateOptionArray.forEach(x => (x.selected = x.id === $event));
      this.setDateRange($event);
      this.page = 0;
      this.getTripList();
    }
  }

  private setDateRange(dateEnum: DateEnum) {
    let fromDate = new Date();
    let toDate = new Date();
    switch (dateEnum) {
      case DateEnum.Today:
        break;
      case DateEnum.LastSevenDays:
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case DateEnum.LastFifteenDays:
        fromDate.setDate(fromDate.getDate() - 15);
        break;
      case DateEnum.LastThirtyDays:
        fromDate.setDate(fromDate.getDate() - 30);
        break;
    }
    this.from = this.datePipe.transform(fromDate, 'yyyy-MM-dd') || '';
    this.to = this.datePipe.transform(toDate, 'yyyy-MM-dd') || '';
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

  onKeyUpSearch($event: any) {
    const value = $event.target.value;
    if (value?.length > 0) {
      this.customer.searchCustomer(value, null).subscribe((company: any) => {
        this.tripSuggestions = company.data.content;
        this.isSearchedMenuOpened = true;
        this.searchFilter = 1;
      });
    } else {
      this.isSearchedMenuOpened = false;
      this.searchValue = '';
      this.page = 0;
      this.getTripList();
      this.searchFilter = 0;
    }
  }

  onSelectedToDate($event: string) {
    this.filterForm.get('endDate')?.setValue($event);
    this.from = this.filterForm.get('startDate')?.value || '';
    this.to = this.filterForm.get('endDate')?.value || '';
    this.dateOpened = false;
    this.isDateOpened = false;
    this.page = 0;
    this.getTripList();
  }

  onSelectedFromDate($event: string) {
    this.filterForm.get('startDate')?.setValue($event);
  }

  onClickSearchSuggestion(result: any) {
    this.page = 0;
    this.searchValue = result.customerCode;
    this.searchName = result.name;
    this.tripSuggestions = [];
    this.isSearchedMenuOpened = false;
    this.getTripList();
  }

  getFilterLength() {
    return this.dateFilter + this.searchFilter + this.tripFilter;
  }

  onClearFilter() {
    this.tripId = '';
    this.page = 0;
    this.searchFilter = 0;
    this.dateFilter = 0;
    this.tripFilter = 0;
    this.searchValue = '';
    this.searchName = '';
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.tripSuggestions = [];
    this.filterForm.reset();
    this.getTripList();
  }

  onStatusClick(tripStatus: string) {
    this.page = 0;
    this.status = tripStatus !== 'All' ? tripStatus : '';
    this.statusButtons.forEach(x => (x.isActive = x.name === tripStatus));
    this.getTripList();
  }

  onClickRightButton() {
    this.rightButtonClicked = true;
    this.leftButtonClicked = false;
  }

  onClickLeftButton() {
    this.leftButtonClicked = true;
    this.rightButtonClicked = false;
  }

  getCountOfGp(trip: any) {
    return trip.customerRate && trip.transporterRate
      ? trip.customerRate - trip.transporterRate
      : 'N/A';
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
    this.dateOpened = false;
    this.isDateOpened = false;
    this.isSearchedMenuOpened = false;
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.getTripList();
    }
  }

  onMaxHeightCross($event: boolean) {
    setTimeout(() => {
      if ($event && this.totalPages > 1 && this.page < 1) {
        this.page = 1;
        this.getTripList();
      }
    }, 300);
  }

  private updateTripList(trip: any) {
    if (this.page === 0) {
      this.loading = true;
      this.tripList = trip.data.responses;
    } else {
      this.loading = false;
      this.tripList.push(...trip.data.responses);
    }
    this.summary = trip.data.summary;
    this.totalPages = trip.data.totalPages;
    this.statusButtons.forEach(x => (x.count = trip.data.statusCount[x.name]));
    this.loading = false;
  }

  onKeyUpTripSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value;
    if (value?.length > 0) {
      this.service
        .getTrips(0, 100, null, null, null, null, value)
        .subscribe((trip: any) => {
          this.tripIdSuggestions = trip.data.responses;
          this.isTripSearchedMenuOpened = true;
        });
    } else {
      this.isTripSearchedMenuOpened = false;
    }
  }

  onClickTripSearchSuggestion(result: any) {
    this.tripFilter = 1;
    this.page = 0;
    this.tripId = result.tripId;
    this.tripIdSuggestions = [];
    this.isTripSearchedMenuOpened = false;
    this.getTripList();
  }
}
