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
import { DateEnum } from './Enum/date.enum';
import { CustomInputSelectModel } from '../../shared/modules/custom-input/custom-input-select.model';
import { ButtonChipsComponent } from './modules/button-chips/button-chips.component';
import { ScrollByButtonDirective } from '../../shared/directive/scroll-by-button.directive';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { statusButtons } from './models/status-buttons';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
import { Trip } from '../auth/models/response/trip';
import { Router } from '@angular/router';
import { TripPoint } from '../manage-trip/model/trip.details.model';
import { numberPipe } from '../../shared/pipes/number-seperator.pipe';
import { PaymentType, TripType } from '../../shared/Enums/payment-type';
import { HandleToastrService } from '../../shared/services/handle-toastr/handle-toastr.service';
import { TripListFilterComponent } from './components/trip-list-filter/trip-list-filter.component';

@Component({
  selector: 'app-trip-list',
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgSelectModule,
    NgForOf,
    DatePipe,
    FormsModule,
    ButtonChipsComponent,
    ScrollByButtonDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    LoadingComponent,
    numberPipe,
    TripListFilterComponent,
  ],
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent implements OnInit, AfterViewInit {
  filterApplied: boolean = false;
  protected transporterName: string;
  filterOpened = false;
  filterForm: FormGroup;
  tripList: Trip[] = [];
  inputPlaceholder = '';
  dateOptionArray: CustomInputSelectModel[] = [];
  paymentTypeValue: string = '';
  searchValue = '';
  from = '';
  to = '';
  status = '';
  searchName = '';
  dateFilter = 0;
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
  customerCode: any[] = [];
  truckType: any[] = [];
  searchId: any;
  paymentFilter: number = 0;
  tripTypeValue: string = '';
  filterData: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private service: TripService,
    private datePipe: DatePipe,
    private router: Router,
    private cd: ChangeDetectorRef,
    private toaster: HandleToastrService
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    localStorage.removeItem('tripFilterData')
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

  private getTripList() {
    this.service
      .getTrips(
        this.page,
        this.size,
        this.customerCode?.toString(),
        this.from,
        this.to,
        this.status,
        this.searchValue,
        this.truckType?.toString(),
        this.tripId,
        null,
        null,
        null,
        null,
        null,
        this.transporterName,
        this.paymentTypeValue,
        this.tripTypeValue
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

  private generateDateOptionsArray() {
    this.dateOptionArray = [
      { id: DateEnum.Today, value: 'Today', selected: false },
      { id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false },
      { id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false },
      { id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false },
      { id: DateEnum.Custom, value: 'Custom', selected: false },
    ];
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

  protected readonly Math = Math;
  excelLoading: boolean = false;
  tripTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'PROJECT', selected: false, showname: 'Project Logistics' },
    {
      id: 2,
      value: 'COMMERCIAL',
      selected: false,
      showname: 'Commercial Logistics',
    },
  ];

  getNameFromEnum(paymentType: string) {
    if (paymentType === PaymentType.CASH) {
      return 'Cash';
    } else if (paymentType === PaymentType.INVOICE) {
      return 'Invoice';
    } else if (paymentType === PaymentType.COMMISSION) {
      return 'Commission';
    } else {
      return 'Cash & Invoice';
    }
  }

  getTripNameFromEnum(paymentType: string) {
    if (paymentType === TripType.COMMERCIAL) {
      return 'Commercial Logistics';
    } else if (paymentType === TripType.PROJECT) {
      return 'Project Logistics';
    } else {
      return 'N/A';
    }
  }

  onClickGenerateReport() {
    this.excelLoading = true;
    const params = {
      customerCode: this.customerCode,
      from: this.from,
      to: this.to,
      status: this.status,
      customerNameOrPhone: this.searchName,
      searchValue: this.searchValue,
      truckType: this.truckType,
      tripId: this.tripId,
      transporterNameOrPhone: this.transporterName,
      paymentType: this.paymentTypeValue,
      tripType: this.tripTypeValue,
    };
    this.service.getTripReport(params).subscribe(
      (response: any) => {
        if (response) {
          const url = window.URL.createObjectURL(response);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.style.display = 'none';
          a.href = url;
          // download link with formated timestamp
          a.download = `TripReport_${new Date().getTime()}.xlsx`;
          a.click();
          this.excelLoading = false;
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      },
      error => {
        this.excelLoading = false;
        this.toaster.showError(error.message);
      }
    );
  }

  onClickFilterOpen() {
    this.filterOpened = true;
  }

  onCLickClearAll() {
    this.filterOpened = false;
    this.filterApplied = false;
    this.page = 0;
    this.size = 30;
    this.customerCode = [];
    this.tripId = '';
    this.truckType = [];
    this.transporterName = '';
    this.paymentTypeValue = '';
    this.tripTypeValue = '';
    this.from = '';
    this.to = '';
    this.loading = true;
    this.tripList = [];
    localStorage.removeItem('tripFilterData');
    this.filterForm.reset();
    this.getTripList();
  }

  onFilterData($event: any) {
    this.filterData = $event;
  }

  onFilterApply() {
    if (
      this.filterData?.startDate ||
      this.filterData?.endDate ||
      this.filterData?.paymentType ||
      this.filterData?.tripType ||
      this.filterData?.customerCode?.length > 0 ||
      this.filterData?.truckType?.length > 0 ||
      this.filterData?.tripId ||
      this.filterData?.transporterName
    ) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.tripList = [];
      this.from = this.filterData.startDate;
      this.to = this.filterData.endDate;
      this.customerCode = this.filterData.customerCode;
      this.tripId = this.filterData.tripId;
      this.truckType = this.filterData.truckType;
      this.transporterName = this.filterData.transporterName;
      this.paymentTypeValue = this.filterData.paymentType;
      this.tripTypeValue = this.filterData.tripType;
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.service.anotherStatusCalled.next(true);
      this.getTripList();
    } else {
      localStorage.removeItem('tripFilterData');
      this.filterApplied = false;
      this.loading = true;
      this.page = 0;
      this.size = 30;
      this.customerCode = [];
      this.tripId = '';
      this.truckType = [];
      this.transporterName = '';
      this.paymentTypeValue = '';
      this.tripTypeValue = '';
      this.from = '';
      this.to = '';
      this.filterForm.reset();
      this.getTripList();
    }
  }

  get filterSummary(): string {
    const parts: string[] = [];

    if (this.filterData.searchName)
      parts.push(`Company: <b>${this.filterData.searchName}</b>`);
    if (this.filterData.transporterName)
      parts.push(`Transporter: <b>${this.filterData.transporterName}</b>`);
    if (this.filterData.startDate)
      parts.push(
        `From: <b>${this.datePipe.transform(this.filterData.startDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.endDate)
      parts.push(
        `To: <b>${this.datePipe.transform(this.filterData.endDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.paymentType)
      parts.push(`Payment Type: <b>${this.filterData.paymentStatus}</b>`);
    if (this.filterData.tripType)
      parts.push(`Trip type: <b>${this.filterData.tripTypeName}</b>`);
    if (this.filterData.tripId)
      parts.push(`Trip ID: <b>${this.filterData.tripId}</b>`);
    if (this.filterData?.customerCode?.length > 0) {
      parts.push(`Customer Code: <b>${this.filterData.customerName?.toString()}</b>`);
    }
    if (this.filterData?.truckType?.length > 0) {
      parts.push(`Truck Type: <b>${this.filterData.selectedTruckValues?.toString()}</b>`);
    }

    return parts.join(', ');
  }

}
