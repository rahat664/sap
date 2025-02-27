import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
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
import { Trip } from '../auth/models/response/trip';
import { Router } from '@angular/router';
import { DriverEditSharedService } from '../profiles/services/driver-edit-shared.service';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { debounceTime, Subject } from 'rxjs';
import { TripPoint } from '../manage-trip/model/trip.details.model';
import { numberPipe } from '../../shared/pipes/number-seperator.pipe';
import { UserService } from '../profiles/services/user.service';
import { PaymentType } from '../../shared/Enums/payment-type';

@Component({
  selector: 'app-trip-list',
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
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    MatFormField,
    MatInput,
    numberPipe,
  ],
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent implements OnInit, AfterViewInit {
  private transporterFilter = 0;
  protected transporterName: string;
  protected transporterSuggestions: any[];
  transporterSearchSubject = new Subject<string>();
  filterOpened = true;
  filterForm: FormGroup;
  isDateOpened = false;
  tripList: Trip[] = [];
  inputPlaceholder = '';
  dateOptionArray: CustomInputSelectModel[] = [];
  paymentTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'CASH', selected: false, showname: 'Cash' },
    { id: 2, value: 'INVOICE', selected: false , showname: 'Invoice'},
    { id: 3, value: 'BOTH', selected: false , showname: 'Cash & Invoice'},
  ];
  paymentTypePlaceholder: string = '';
  paymentTypeValue: string = '';
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
    pms: 0,
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
  tripId = '';
  isTripSearchedMenuOpened = false;
  tripIdSuggestions: any[] = [];
  tripFilter = 0;
  size = 0;
  anotherStatusCalled: boolean;
  customerCode: any;
  truckType: string;
  searchSubject = new Subject<string>();
  customerSearchSubject = new Subject<string>();
  searchId: any;
  searchTransporter: any;
   paymentFilter: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private service: TripService,
    private datePipe: DatePipe,
    private customer: CustomerService,
    private shared: DriverEditSharedService,
    private router: Router,
    private transporter: UserService,
    private cd: ChangeDetectorRef
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
    this.searchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performSearch(searchText);
    });
    this.customerSearchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performCustomerSearch(searchText);
    });
    this.transporterSearchSubject
      .pipe(debounceTime(1000))
      .subscribe(searchText => {
        this.performTransporterSearch(searchText);
      });
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    if (localStorage.getItem('filter')) {
      this.status = localStorage.getItem('filter') || '';
      this.statusButtons.forEach(x => (x.isActive = x.name === this.status));
      localStorage.removeItem('filter');
    } else {
      this.status = '';
      this.statusButtons.forEach(x => (x.isActive = x.name === 'All'));
    }
    this.loading = true;
    this.page = 0;
    this.size = 30;
    this.getTripList();
    this.service.anotherStatusCalled.subscribe(value => {
      this.anotherStatusCalled = value;
    });
    this.generateDateOptionsArray();
  }

  private performTransporterSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.transporter
        .getTransporter(0, 100, searchText)
        .subscribe((transporter: any) => {
          this.transporterSuggestions = transporter.data.responses;
          if (this.transporterSuggestions.length === 0) {
            this.transporterSuggestions.push('No transporter found');
          }
        });
    } else {
      this.resetTransporterSearch();
    }
  }

  private resetTransporterSearch() {
    this.isTripSearchedMenuOpened = false;
    this.transporterName = '';
    this.page = 0;
    this.size = 30;
    this.transporterSuggestions = [];
    this.transporterSuggestions.push('No transporter found');
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
    this.transporterFilter = 0;
  }

  private getTripList() {
    this.service
      .getTrips(
        this.page,
        this.size,
        this.customerCode,
        this.from,
        this.to,
        this.status,
        this.searchValue,
        this.truckType,
        this.tripId,
        null,
        null,
        null,
        null,
        null,
        this.transporterName,
        this.paymentTypeValue
      )
      .subscribe(
        (trip: any) => {
          this.updateTripList(trip);
        },
        error => {
          this.loading = false;
        }
      );
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
      this.service.anotherStatusCalled.next(true);
      this.getTripList();
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

  private generateDateOptionsArray() {
    this.dateOptionArray = [
      { id: DateEnum.Today, value: 'Today', selected: false },
      { id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false },
      { id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false },
      { id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false },
      { id: DateEnum.Custom, value: 'Custom', selected: false },
    ];
  }

  onSearchInputChange($event: any) {
    const value = $event.target.value;
    this.searchSubject.next(value); // Trigger the Subject when input changes
  }

  performSearch(value: string) {
    if (value?.length > 0) {
      this.customer.searchCustomer(0, 100, value).subscribe((company: any) => {
        this.tripSuggestions = company.data.content;
        if (this.tripSuggestions.length === 0) {
          this.tripSuggestions.push('No customer found');
        }
        this.isSearchedMenuOpened = true;
      });
    } else {
      this.resetSearch();
    }
  }

  resetSearch() {
    this.isSearchedMenuOpened = false;
    this.customerCode = '';
    this.searchValue = '';
    this.page = 0;
    this.size = 30;
    this.tripSuggestions = ['No customer found'];
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
    this.searchFilter = 0;
  }

  onSelectedToDate($event: string) {
    this.filterForm.get('endDate')?.setValue($event);
    this.from = this.filterForm.get('startDate')?.value || '';
    this.to = this.filterForm.get('endDate')?.value || '';
    this.dateOpened = false;
    this.isDateOpened = false;
    this.page = 0;
    this.size = 30;
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onSelectedFromDate($event: string) {
    this.filterForm.get('startDate')?.setValue($event);
  }

  onClickSearchSuggestion(result: any) {
    this.searchFilter = 1;
    this.loading = true;
    this.page = 0;
    this.customerCode = result.customerCode;
    this.searchName = result.name;
    this.searchValue = result.name;
    this.tripSuggestions = [];
    this.isSearchedMenuOpened = false;
    this.size = 30;
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  getFilterLength() {
    return (
      this.dateFilter +
      this.searchFilter +
      this.tripFilter +
      this.transporterFilter + this.paymentFilter
    );
  }

  onClearFilter() {
    this.paymentTypePlaceholder = '';
    this.paymentTypeValue = '';
    this.paymentFilter = 0;
    this.customerCode = '';
    this.tripId = '';
    this.page = 0;
    this.size = 30;
    this.searchFilter = 0;
    this.dateFilter = 0;
    this.tripFilter = 0;
    this.searchValue = '';
    this.transporterName = '';
    this.transporterFilter = 0;
    this.searchName = '';
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.tripSuggestions = [];
    this.filterForm.reset();
    this.loading = true;
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onStatusClick(tripStatus: string) {
    this.loading = true;
    this.page = 0;
    this.size = 30;
    this.status = tripStatus !== 'All' ? tripStatus : '';
    this.statusButtons.forEach(x => (x.isActive = x.name === tripStatus));
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onKeyUpTransporterSearch($event: any) {
    const value = $event.target.value;
    this.transporterSearchSubject.next(value); // Trigger the Subject when input changes
  }

  onClickTransporterSearchSuggestion(result: any) {
    this.transporterFilter = 1;
    this.page = 0;
    this.transporterName = result.name;
    this.searchTransporter = result.name;
    this.transporterSuggestions = [];
    this.isTripSearchedMenuOpened = false;
    this.loading = true;
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickClearTransporter() {
    this.transporterName = '';
    this.searchTransporter = '';
    this.transporterFilter = 0;
    this.transporterSuggestions = [];
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.service.anotherStatusCalled.next(true);
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
    this.shared.closeInputSelect.next(false);
  }

  onBottom($event: boolean) {
    if (!$event) {
      this.service.anotherStatusCalled.next(false);
    }
    if ($event && this.page < this.totalPages - 1) {
      if (this.anotherStatusCalled) {
      } else {
        this.page++;
        this.size = 30;
        this.loading = false;
        this.getTripList();
      }
    }
  }

  onMaxHeightCross($event: boolean) {
    // setTimeout(() => {
    //   if (!$event && this.totalPages > 1 && this.page < 1) {
    //     this.page = 1;
    //     this.loading = false;
    //     this.getTripList();
    //   }
    // }, 1000);
  }

  private updateTripList(trip: any) {
    this.loading = false;
    if (this.page === 0) {
      this.tripList = trip.data.responses;
    } else {
      this.tripList.push(...trip.data.responses);
    }
    this.summary = trip.data.summary;
    this.totalPages = trip.data.totalPages;
    this.statusButtons.forEach(x => (x.count = trip.data.statusCount[x.name]));
    this.loading = false;
  }

  onKeyUpTripSearch($event: any) {
    const value = $event.target.value;
    this.customerSearchSubject.next(value); // Trigger the Subject when input changes
  }

  onClickTripSearchSuggestion(result: any) {
    this.tripFilter = 1;
    this.page = 0;
    this.tripId = result.tripId;
    this.searchId = result.tripId;
    this.tripIdSuggestions = [];
    this.isTripSearchedMenuOpened = false;
    this.loading = true;
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  onClickTripNumber(tripId: string) {
    localStorage.setItem('fromTripListTripId', tripId);
    this.router.navigateByUrl('/manage-trip');
  }

  private performCustomerSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.service.getTripSuggestions(searchText).subscribe((trip: any) => {
        this.tripIdSuggestions = trip.responses;
        if (this.tripIdSuggestions.length === 0) {
          this.tripIdSuggestions.push('No trip found');
        }
      });
    } else {
      this.resetTripIdSearch();
    }
  }

  private resetTripIdSearch() {
    this.isTripSearchedMenuOpened = false;
    this.tripId = '';
    this.page = 0;
    this.size = 30;
    this.tripIdSuggestions = [];
    this.tripIdSuggestions.push('No trip found');
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
    this.tripFilter = 0;
  }

  getLoadingPointsName(tripPoints: TripPoint[]) {
    return tripPoints.filter(trip => trip.pointType === 'Loading');
  }

  getUnloadingPointsName(tripPoints: TripPoint[]) {
    return tripPoints.filter(trip => trip.pointType === 'Unloading');
  }

  onClickClearCompany() {
    this.searchName = '';
    this.searchValue = '';
    this.customerCode = '';
    this.searchFilter = 0;
    this.page = 0;
    this.size = 30;
    this.tripSuggestions = [];
    this.loading = true;
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickClearTripId() {
    this.searchId = '';
    this.tripId = '';
    this.page = 0;
    this.tripIdSuggestions = [];
    this.size = 30;
    this.loading = true;
    this.service.anotherStatusCalled.next(true);
    this.getTripList();
  }

  protected readonly Math = Math;

  onSelectPayment($event: number) {
    this.paymentFilter = 1;
    this.paymentTypeOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.paymentTypePlaceholder =
      this.paymentTypeOptionsArray.find(x => x.id === $event)?.showname || '';
    this.paymentTypeValue = this.paymentTypeOptionsArray.find(x => x.id === $event)?.value || '';
    this.service.anotherStatusCalled.next(true);
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.getTripList();
  }

  getNameFromEnum(paymentType: string) {
    if (paymentType === PaymentType.CASH) {
      return 'Cash';
    } else if (paymentType === PaymentType.INVOICE) {
      return 'Invoice';
    } else {
      return 'Cash & Invoice';
    }
  }
}
