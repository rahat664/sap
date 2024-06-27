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
  ],
  templateUrl: './trip-list.component.html',
  styleUrl: './trip-list.component.scss',
})
export class TripListComponent implements OnInit {
  filterOpened = false;
  filterForm: FormGroup;
  isDateOpened = false;
  tripList: Trip[] = [];
  inputPlaceholder = '';
  dateOptionArray: CustomInputSelectModel[] = [];
  searchValue: string;
  from: string;
  to: string;
  status: string;
  tripSuggestions: any;
  isSearchedMenuOpened = false;
  searchName: string;
  dateFilter = 0;
  searchFilter = 0;
  summary = {
    trips: 0,
    trs: 0,
    crs: 0,
    gps: 0,
  };
  statusButtons = statusButtons;
  rightButtonClicked: boolean;
  leftButtonClicked: boolean;
  right = '0px';
  height = '0px';
  scrollable = true;
  dateOpened = false;
  loading = false;
  page: number = 0;
  totalPages: number;

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
    this.loading = true;
    // get trip list
    if (this.searchValue && !this.from && !this.to && !this.status) {
      this.service
        .getTrips(this.page, this.searchValue, null, null, null)
        .subscribe((trip: any) => {
          this.tripList = trip.data.responses;
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (this.searchValue && this.from && this.to && this.status) {
      this.service
        .getTrips(this.page, this.searchValue, this.from, this.to, this.status)
        .subscribe((trip: any) => {
          this.tripList = trip.data.responses;
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (this.searchValue && this.from && this.to && !this.status) {
      this.service
        .getTrips(this.page, this.searchValue, this.from, this.to, null)
        .subscribe((trip: any) => {
          this.tripList = trip.data.responses;
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (this.searchValue && !this.from && !this.to && this.status) {
      this.service
        .getTrips(this.page, this.searchValue, null, null, this.status)
        .subscribe((trip: any) => {
          this.tripList = trip.data.responses;
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (!this.searchValue && this.from && this.to && this.status) {
      this.service
        .getTrips(this.page, null, this.from, this.to, this.status)
        .subscribe((trip: any) => {
          this.tripList = trip.data.responses;
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (!this.searchValue && this.from && this.to && !this.status) {
      this.service
        .getTrips(this.page, null, this.from, this.to, null)
        .subscribe((trip: any) => {
          this.tripList = trip.data.responses;
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (!this.searchValue && !this.from && !this.to && this.status) {
      this.service
        .getTrips(this.page, null, null, null, this.status)
        .subscribe((trip: any) => {
          this.tripList = trip.data.responses;
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else {
      this.service.getTrips(this.page).subscribe((trip: any) => {
        this.tripList = trip.data.responses;
        this.summary = trip.data.summary;
        this.totalPages = trip.data.totalPages;
        this.statusButtons.forEach(
          x => (x.count = trip.data.statusCount[x.name])
        );
        this.loading = false;
      });
    }
  }

  onSelectDate($event: number) {
    this.dateFilter = 1;
    // handle date selection
    if ($event === DateEnum.Custom) {
      this.isDateOpened = true;
      this.dateOpened = true;
    } else {
      this.isDateOpened = false;
      this.dateOpened = false;
      this.inputPlaceholder = this.dateOptionArray.find(
        x => x.id === $event
      )?.value;
      this.dateOptionArray.forEach(x => (x.selected = x.id === $event));
      switch ($event) {
        case DateEnum.LastSevenDays:
          this.from = new Date(
            new Date().setDate(new Date().getDate() - 7)
          ).toISOString();
          this.to = new Date().toISOString();
          this.from = this.datePipe.transform(this.from, 'yyyy-MM-dd');
          this.to = this.datePipe.transform(this.to, 'yyyy-MM-dd');
          break;
        case DateEnum.LastFifteenDays:
          this.from = new Date(
            new Date().setDate(new Date().getDate() - 15)
          ).toISOString();
          this.to = new Date().toISOString();
          this.from = this.datePipe.transform(this.from, 'yyyy-MM-dd');
          this.to = this.datePipe.transform(this.to, 'yyyy-MM-dd');
          break;
        case DateEnum.LastThirtyDays:
          this.from = new Date(
            new Date().setDate(new Date().getDate() - 30)
          ).toISOString();
          this.to = new Date().toISOString();
          this.from = this.datePipe.transform(this.from, 'yyyy-MM-dd');
          this.to = this.datePipe.transform(this.to, 'yyyy-MM-dd');
          break;
      }
      this.page = 0;
      this.getTripList();
    }
  }

  private generateDateOptionsArray() {
    // generate date options array
    this.dateOptionArray = [
      { id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false },
      { id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false },
      { id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false },
      { id: DateEnum.Custom, value: 'Custom', selected: false },
    ];
  }

  onKeyUpSearch($event: any) {
    if ($event.target.value.length > 0) {
      this.tripSuggestions = [];
      this.customer
        .searchCustomer($event.target.value, null)
        .subscribe((company: any) => {
          this.tripSuggestions = company.data;
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
    this.filterForm.get('endDate').setValue($event);
    this.from = this.filterForm.get('startDate').value;
    this.to = this.filterForm.get('endDate').value;
    this.dateOpened = false;
    this.isDateOpened = false;
    this.page = 0;
    this.getTripList();
  }

  onSelectedFromDate($event: string) {
    this.filterForm.get('startDate').setValue($event);
  }

  onClickSearchSuggestion(result: any) {
    this.searchValue = result.customerCode;
    this.searchName = result.name;
    this.tripSuggestions = [];
    this.isSearchedMenuOpened = false;
    this.getTripList();
  }

  getFilterLength() {
    return this.dateFilter + this.searchFilter;
  }

  onClearFilter() {
    this.searchFilter = 0;
    this.dateFilter = 0;
    this.searchValue = '';
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.getTripList();
  }

  onStatusClick(tripStatus: string) {
    if (tripStatus != 'All') {
      this.status = tripStatus;
    } else {
      this.status = '';
    }
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
    if (trip.customerRate && trip.transporterRate) {
      return trip.customerRate - trip.transporterRate;
    } else {
      return 'N/A';
    }
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
      this.scrolledData();
    }
  }

  onMaxHeightCross($event: boolean) {
    setTimeout(() => {
      if (!$event && this.totalPages > 1 && this.page < 1) {
        this.page = 1;
        this.scrolledData();
      }
    }, 1);
  }

  scrolledData() {
    if (this.searchValue && !this.from && !this.to && !this.status) {
      this.service
        .getTrips(this.page, this.searchValue, null, null, null)
        .subscribe((trip: any) => {
          this.tripList.push(...trip.data.responses);
          this.summary = trip.data.summary;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.totalPages = trip.data.totalPages;
          this.loading = false;
        });
    } else if (this.searchValue && this.from && this.to && this.status) {
      this.service
        .getTrips(this.page, this.searchValue, this.from, this.to, this.status)
        .subscribe((trip: any) => {
          this.tripList.push(...trip.data.responses);
          this.totalPages = trip.data.totalPages;
          this.summary = trip.data.summary;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (this.searchValue && this.from && this.to && !this.status) {
      this.service
        .getTrips(this.page, this.searchValue, this.from, this.to, null)
        .subscribe((trip: any) => {
          this.tripList.push(...trip.data.responses);
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (this.searchValue && !this.from && !this.to && this.status) {
      this.service
        .getTrips(this.page, this.searchValue, null, null, this.status)
        .subscribe((trip: any) => {
          this.tripList.push(...trip.data.responses);
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (!this.searchValue && this.from && this.to && this.status) {
      this.service
        .getTrips(this.page, null, this.from, this.to, this.status)
        .subscribe((trip: any) => {
          this.tripList.push(...trip.data.responses);
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (!this.searchValue && this.from && this.to && !this.status) {
      this.service
        .getTrips(this.page, null, this.from, this.to, null)
        .subscribe((trip: any) => {
          this.tripList.push(...trip.data.responses);
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else if (!this.searchValue && !this.from && !this.to && this.status) {
      this.service
        .getTrips(this.page, null, null, null, this.status)
        .subscribe((trip: any) => {
          this.tripList.push(...trip.data.responses);
          this.summary = trip.data.summary;
          this.totalPages = trip.data.totalPages;
          this.statusButtons.forEach(
            x => (x.count = trip.data.statusCount[x.name])
          );
          this.loading = false;
        });
    } else {
      this.service.getTrips(this.page).subscribe((trip: any) => {
        this.tripList.push(...trip.data.responses);
        this.totalPages = trip.data.totalPages;
        this.summary = trip.data.summary;
        this.statusButtons.forEach(
          x => (x.count = trip.data.statusCount[x.name])
        );
        this.loading = false;
      });
    }
  }
}
