import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { CustomInputComponent } from '../../shared/modules/custom-input/custom-input.component';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { GetClickEventDirective } from '../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ChallanDashboardService } from './challan-dashboard.service';
import { TripService } from '../trip-list/services/trip.service';
import { Trip, Truck } from '../auth/models/response/trip';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmApproveComponent } from '../../shared/modules/confirm-approve/confirm-approve.component';
import { ConfirmRejectComponent } from '../../shared/modules/confirm-reject/confirm-reject.component';
import { ConfirmReceiveeComponentComponent } from '../../shared/modules/confirm-receivee-component/confirm-receivee-component.component';
import { Router, RouterLink } from '@angular/router';
import { CustomInputSelectModel } from '../../shared/modules/custom-input/custom-input-select.model';
import { debounceTime, of, Subject } from 'rxjs';
import { CustomerService } from '../profiles/services/customer.service';
import { DateEnum } from '../trip-list/Enum/date.enum';
import { DriverEditSharedService } from '../profiles/services/driver-edit-shared.service';
import { UserService } from '../profiles/services/user.service';
import { TruckService } from '../profiles/components/truck/services/truck.service';
import { mergeMap } from 'rxjs/operators';
import { TruckDocumentType } from '../../shared/Enums/registration_type';
import { TripPoint } from '../manage-trip/model/trip.details.model';
import { HandleToastrService } from '../../shared/services/handle-toastr/handle-toastr.service';
import { numberPipe } from '../../shared/pipes/number-seperator.pipe';

@Component({
  selector: 'app-challan-dashboard',
  imports: [
    CustomInputComponent,
    DatePipe,
    FormsModule,
    GetClickEventDirective,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    LoadingComponent,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    NgForOf,
    NgIf,
    NgClass,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
    numberPipe,
  ],
  templateUrl: './challan-dashboard.component.html',
  styleUrl: './challan-dashboard.component.scss',
})
export class ChallanDashboardComponent implements OnInit, AfterViewInit {
  private dateFilter = 0;
  private searchFilter = 0;
  private tripFilter = 0;
  private customerCode: string;
  private to: string;
  private from: string;
  searchValue: string;
  filterForm: FormGroup;
  private isSearchedMenuOpened: boolean;
  private isTripSearchedMenuOpened: boolean;
  private isDateOpened: boolean;
  protected truckRegistrationId: string;
  protected transporterName: string;
  private transporterFilter = 0;
  private truckFilter = 0;
  protected truckRegSuggestions: any[] = [];
  protected transporterSuggestions: any[];
  searchRegistationId: any;
  searchTransporter: any;
  searchId: any;

  get tripSuggestions(): any {
    return this._tripSuggestions;
  }

  set tripSuggestions(value: any) {
    this._tripSuggestions = value;
  }

  height: any = '0px';
  pendingChallanAmount = 0;
  pendingChallanText = '';
  receivedAmount = 0;
  receivedText = 'Received';
  pendingAmount = 0;
  pendingText = 'In-progress';
  approvedAmount = 0;
  approvedText = 'Approved';
  rejectedAmount = 0;
  rejectedText = 'Rejected';
  completedTrips = 0;
  completedTripsText = 'No. of completed trips';
  hardCopyReceived = 0;
  hardCopyReceivedText = 'Hardcopy received';
  fromDate: string;
  toDate: string;
  private size = 30;
  protected loading: boolean;
  private page = 0;
  protected tripList: Trip[] = [];
  protected totalPages: any = 0;
  private anotherStatusCalled: boolean;
  activatedChallanStatus = 'Completed';
  chalanStatus: string;
  status: string;
  challanHardCopyReceived: boolean;
  readonly dialog = inject(MatDialog);
  filterOpened = true;
  dateOpened: boolean;
  inputPlaceholder: string;
  dateOptionArray: CustomInputSelectModel[];
  searchName: any;
  private _tripSuggestions: any;
  tripId: any;
  tripIdSuggestions: any;
  searchSubject = new Subject<string>();
  customerSearchSubject = new Subject<string>();
  truckSearchSubject = new Subject<string>();
  transporterSearchSubject = new Subject<string>();

  constructor(
    private datePipe: DatePipe,
    private service: ChallanDashboardService,
    private trip: TripService,
    private number: DecimalPipe,
    private formBuilder: FormBuilder,
    private customer: CustomerService,
    private shared: DriverEditSharedService,
    private transporter: UserService,
    private truck: TruckService,
    private router: Router,
    private toastr: HandleToastrService,
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
    this.customerSearchSubject
      .pipe(debounceTime(1000))
      .subscribe(searchText => {
        this.performCustomerSearch(searchText);
      });
    this.truckSearchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performTruckSearch(searchText);
    });
    this.transporterSearchSubject
      .pipe(debounceTime(1000))
      .subscribe(searchText => {
        this.performTransporterSearch(searchText);
      });
  }

  private performCustomerSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.trip.getTripSuggestions(searchText).subscribe((trip: any) => {
        this.tripIdSuggestions = trip.responses;
        if (this.tripIdSuggestions.length === 0) {
          this.tripIdSuggestions.push('No trip found');
        }
      });
    } else {
      this.resetTripIdSearch();
    }
  }

  private performTruckSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.truck.getTruckList(0, 100, searchText).subscribe((truck: any) => {
        this.truckRegSuggestions = truck.data.responses;
        if (this.truckRegSuggestions.length === 0) {
          this.truckRegSuggestions.push('No trip found');
        }
      });
    } else {
      this.resetTruckSearch();
    }
  }

  private performTransporterSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.transporter
        .getTransporter(0, 100, searchText)
        .subscribe((transporter: any) => {
          this.transporterSuggestions = transporter.data.responses;
          if (this.transporterSuggestions.length === 0) {
            this.transporterSuggestions.push('No trip found');
          }
        });
    } else {
      this.resetTransporterSearch();
    }
  }

  private resetTripIdSearch() {
    this.isTripSearchedMenuOpened = false;
    this.tripId = '';
    this.page = 0;
    this.size = 30;
    this.tripIdSuggestions = [];
    this.tripIdSuggestions.push('No trip found');
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
    this.tripFilter = 0;
  }

  private resetTruckSearch() {
    this.isTripSearchedMenuOpened = false;
    this.truckRegistrationId = '';
    this.page = 0;
    this.size = 30;
    this.truckRegSuggestions = [];
    this.truckRegSuggestions.push('No truck found');
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
    this.truckFilter = 0;
  }

  private resetTransporterSearch() {
    this.isTripSearchedMenuOpened = false;
    this.transporterName = '';
    this.page = 0;
    this.size = 30;
    this.transporterSuggestions = [];
    this.transporterSuggestions.push('No trip found');
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
    this.transporterFilter = 0;
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
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
    this.searchFilter = 0;
  }

  ngOnInit() {
    this.activatedChallanStatus = 'Completed';
    this.chalanStatus = '';
    this.status = 'Completed';
    this.getFromDateAndToDate();
    this.loading = true;
    this.anotherStatusCalled = false;
    this.generateDateOptionsArray();
    this.getTripList();
    const isFromBack = localStorage.getItem('isBack');
    if (isFromBack !== 'true') {
    } else {
      localStorage.removeItem('isBack');
    }
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  private getFromDateAndToDate() {
    // fromdate will be the first day of the current month
    // fromDate will be 1st january 2024
    const fromDate = new Date();
    fromDate.setFullYear(2024);
    fromDate.setMonth(0);
    fromDate.setDate(1);
    this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd');
    // todate should be the current date
    const toDate = new Date();
    // to date will be the last day of the current month
    this.toDate = this.datePipe.transform(
      new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0),
      'yyyy-MM-dd'
    );
  }

  private getChallanStatus() {
    this.service
      .getChallanStatus(this.fromDate, this.toDate)
      .subscribe((res: any) => {
        this.pendingChallanAmount =
          res.data.totalCustomerRateForPendingChallans;
        this.receivedAmount = res.data.received;
        this.pendingAmount = res.data.inProgress;
        this.approvedAmount = res.data.approved;
        this.rejectedAmount = res.data.rejected;
        this.hardCopyReceived = res.data.totalHardCopyReceived;
      });
  }

  private getTripList() {
    this.trip
      .getTrips(
        this.page,
        this.size,
        this.customerCode,
        null,
        null,
        this.status,
        this.tripId,
        null,
        null,
        this.chalanStatus,
        this.challanHardCopyReceived,
        this.from,
        this.to,
        this.truckRegistrationId,
        this.transporterName
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

  private updateTripList(trip: any) {
    this.loading = false;
    this.completedTrips = trip.data?.statusCount?.Completed || 0;
    this.totalPages = trip.data.totalPages;
    this.pendingChallanText = `Pending challan value for ${this.number.transform(trip.data?.challanStatusCount?.Pending) || 0} ${trip.data?.challanStatusCount?.Pending === 1 ? 'trip' : 'trips'}`;
    this.receivedAmount = trip.data?.challanStatusCount?.Received || 0;
    this.pendingAmount = trip.data?.challanStatusCount['In-progress'] || 0;
    this.approvedAmount = trip.data?.challanStatusCount?.Approved || 0;
    this.rejectedAmount = trip.data?.challanStatusCount?.Rejected || 0;
    this.pendingChallanAmount =
      trip.data?.challanStatusCount?.totalCustomerRateForPendingChallans || 0;
    this.hardCopyReceived =
      trip.data?.challanStatusCount?.HardCopyReceived || 0;
    if (this.page === 0) {
      this.tripList = trip.data.responses;
    } else {
      this.tripList.push(...trip.data.responses);
    }
  }

  onBottom($event: boolean) {
    if (!$event) {
      this.trip.anotherStatusCalled.next(false);
    }
    if ($event && this.page < this.totalPages - 1) {
      if (this.anotherStatusCalled) {
      } else {
        this.loading = false;
        this.page++;
        this.size = 30;
        this.loading = false;
        this.getTripList();
      }
    }
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  getCountOfGp(trip: Trip) {
    return trip.customerRate && trip.transporterRate
      ? trip.customerRate - trip.transporterRate
      : 'N/A';
  }

  onClickStatusButtons(status: any) {
    this.loading = true;
    this.challanHardCopyReceived = false;
    this.activatedChallanStatus = status;
    this.chalanStatus = status;
    if (status === 'Completed') {
      this.status = 'Completed';
      this.chalanStatus = null;
    } else if (status === 'hardcopy') {
      this.chalanStatus = null;
      this.challanHardCopyReceived = true;
    }
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.tripList = [];
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  changeStatus(id, name, status: string) {
    const body = {
      challanStatus: status,
    };
    if (status === 'Approved') {
      this.dialog
        .open(ConfirmApproveComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the challan for trip ID ',
            text: `${name}?`,
            buttonText: 'Approve',
          },
        })
        .afterClosed()
        .subscribe(res => {
          if (res) {
            this.service.updateChallanStatus(id, body).subscribe((res: any) => {
              this.page = 0;
              this.getChallanStatus();
              this.toastr.showSuccess('Challan approved successfully');
              this.getTripList();
            });
          }
        });
    } else {
      this.dialog
        .open(ConfirmRejectComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the challan for trip ID ',
            text: `${name}?`,
            buttonText: 'Reject',
            reasonAvailable: false,
          },
        })
        .afterClosed()
        .subscribe(res => {
          if (res) {
            this.service.updateChallanStatus(id, body).subscribe((res: any) => {
              this.page = 0;
              this.getChallanStatus();
              this.toastr.showSuccess('Challan rejected successfully');
              this.getTripList();
            });
          }
        });
    }
  }

  getFullRegistrationNumber(truck: Truck) {
    if (truck) {
      return `${truck.registrationZone} ${truck.registrationCategory} ${truck.registrationSerial}-${truck.registrationNum}`;
    } else {
      return 'truck not found';
    }
  }

  getBgColor(challanStatus: string, type: string) {
    switch (challanStatus) {
      case 'Pending':
        return type === 'bg' ? 'bg-[#F0F3F3]' : 'text-[#066A78]';
      case 'Approved':
        return type === 'bg' ? 'bg-[#E4F3EC]' : 'text-[#087D46]';
      case 'Rejected':
        return type === 'bg' ? 'bg-[#F9EBE9]' : 'text-[#961801]';
      case 'In-Progress':
        return type === 'bg' ? 'bg-[#FCF5E9]' : 'text-[#D38704]';
      default:
        return type === 'bg' ? 'bg-[#FCF5E9]' : 'text-[#D38704]';
    }
  }

  checkDueDays(trip: Trip) {
    const tripCompletedDate = new Date(trip.tripEndedAt);
    if (trip.challanStatusUpdatedAt) {
      const challanStatusUpdatedDate = new Date(trip.challanStatusUpdatedAt);
      return this.datePipe.transform(
        challanStatusUpdatedDate,
        'dd MMM,yyyy h:mm a'
      );
    } else {
      // return due days from trip end date
      const currentDate = new Date();
      const diffTime = Math.abs(
        currentDate.getTime() - tripCompletedDate.getTime()
      );
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  }

  onClickHardCopyReceive(tripId: string) {
    this.dialog
      .open(ConfirmReceiveeComponentComponent, {
        data: {
          title: 'Receive Challan',
          textPrefix: 'Have you received the hardcopy for ',
          text: `${tripId}?`,
          buttonText: 'Receive',
        },
        minWidth: '21.375rem',
      })
      .afterClosed()
      .subscribe(res => {
        if (res) {
          const body = {
            hardCopyReceivedAt: this.datePipe.transform(
              res,
              'yyyy-MM-ddTHH:mm:ss'
            ),
          };
          this.service
            .updateChallanStatus(tripId, body)
            .subscribe((res: any) => {
              this.toastr.showSuccess('Challan received successfully');
              this.page = 0;
              this.getChallanStatus();
              this.getTripList();
            });
        }
      });
  }

  getFilterLength() {
    return (
      this.dateFilter +
      this.searchFilter +
      this.tripFilter +
      this.truckFilter +
      this.transporterFilter
    );
  }

  onClearFilter() {
    this.customerCode = '';
    this.tripId = '';
    this.page = 0;
    this.size = 30;
    this.searchFilter = 0;
    this.dateFilter = 0;
    this.transporterFilter = 0;
    this.truckFilter = 0;
    this.tripFilter = 0;
    this.searchValue = '';
    this.searchName = '';
    this.from = '';
    this.to = '';
    this.truckRegistrationId = '';
    this.transporterName = '';
    this.filterForm.reset();
    this.inputPlaceholder = '';
    this.tripSuggestions = [];
    this.loading = true;
    this.chalanStatus = '';
    this.status = 'Completed';
    this.activatedChallanStatus = 'Completed';
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
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
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onSelectDate($event: number) {
    this.chalanStatus = '';
    this.status = 'Completed';
    this.activatedChallanStatus = 'Completed';
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
      this.trip.anotherStatusCalled.next(true);
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

  onSearchInputChange($event: any) {
    const value = $event.target.value;
    this.searchSubject.next(value); // Trigger the Subject when input changes
  }

  onClickSearchSuggestion(result: any) {
    this.chalanStatus = '';
    this.status = 'Completed';
    this.activatedChallanStatus = 'Completed';
    this.searchFilter = 1;
    this.loading = true;
    this.page = 0;
    this.customerCode = result.customerCode;
    this.searchName = result.name;
    this.searchValue = result.name;
    this.tripSuggestions = [];
    this.isSearchedMenuOpened = false;
    this.size = 30;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onKeyUpTripSearch($event: any) {
    const value = $event.target.value;
    this.customerSearchSubject.next(value); // Trigger the Subject when input changes
  }

  onKeyUpTruckSearch($event: any) {
    const value = $event.target.value;
    this.truckSearchSubject.next(value); // Trigger the Subject when input changes
  }

  onKeyUpTransporterSearch($event: any) {
    const value = $event.target.value;
    this.transporterSearchSubject.next(value); // Trigger the Subject when input changes
  }

  onClickTripSearchSuggestion(result: any) {
    this.chalanStatus = '';
    this.status = 'Completed';
    this.activatedChallanStatus = 'Completed';
    this.tripFilter = 1;
    this.page = 0;
    this.tripId = result.tripId;
    this.searchId = result.tripId;
    this.tripIdSuggestions = [];
    this.isTripSearchedMenuOpened = false;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickTruckSearchSuggestion(result: any) {
    this.chalanStatus = '';
    this.status = 'Completed';
    this.activatedChallanStatus = 'Completed';
    this.truckFilter = 1;
    this.page = 0;
    this.truckRegistrationId = result.fullRegistrationNumber;
    this.searchRegistationId = result.fullRegistrationNumber;
    this.truckRegSuggestions = [];
    this.isTripSearchedMenuOpened = false;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickTransporterSearchSuggestion(result: any) {
    this.chalanStatus = '';
    this.status = 'Completed';
    this.activatedChallanStatus = 'Completed';
    this.transporterFilter = 1;
    this.page = 0;
    this.transporterName = result.name;
    this.searchTransporter = result.name;
    this.transporterSuggestions = [];
    this.isTripSearchedMenuOpened = false;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
    this.dateOpened = false;
    this.isDateOpened = false;
    this.isSearchedMenuOpened = false;
    this.shared.closeInputSelect.next(false);
  }

  onClickSoftCopyView(tripId: string) {
    this.trip
      .getAllTripEvent(tripId, 'Loading')
      .pipe(
        mergeMap((loadingRes: any) => {
          const loadingEvents = loadingRes.data.filter(
            event => event.eventName === 'Upload loading challan'
          );
          return this.trip.getAllTripEvent(tripId, 'Unloading').pipe(
            mergeMap((unloadingRes: any) => {
              const unloadingEvents = unloadingRes.data.filter(
                event => event.eventName === 'Upload unloading challan'
              );
              return of({ loadingEvents, unloadingEvents });
            })
          );
        })
      )
      .subscribe(({ loadingEvents, unloadingEvents }) => {
        const allEvents = [...loadingEvents, ...unloadingEvents];
        //concat two event
        // concat two tripDocuments
        const documents = [];
        allEvents.map(event => {
          event.tripDocuments?.map(doc => {
            documents.push({
              document: doc,
              event: event,
            });
          });
        });
        if (documents.length > 0) {
          this.router.navigate(['/image-details'], {
            state: {
              tripDocuments: documents,
              activatedDocument: documents[0],
              returnUrl: '/challan-management',
              tripId: tripId,
            },
          });
        }
      });
  }

  protected readonly truckEnum = TruckDocumentType;

  checkDocumentIsAvailableOrNot(tripId: string): any {
    const loadingEvents = [];
    const unloadingEvents = [];
    this.trip
      .getAllTripEvent(tripId, 'Loading')
      .pipe(
        mergeMap((loadingRes: any) => {
          const loadingEvents = loadingRes.data.filter(
            event => event.eventName === 'Upload loading challan'
          );
          return this.trip.getAllTripEvent(tripId, 'Unloading').pipe(
            mergeMap((unloadingRes: any) => {
              const unloadingEvents = unloadingRes.data.filter(
                event => event.eventName === 'Upload unloading challan'
              );
              return of({ loadingEvents, unloadingEvents });
            })
          );
        })
      )
      .subscribe(({ loadingEvents, unloadingEvents }) => {
        const allEvents = [...loadingEvents, ...unloadingEvents];
        //concat two event
        // concat two tripDocuments
        const documents = [];
        allEvents.map(event => {
          event.tripDocuments?.map(doc => {
            documents.push({
              document: doc,
              event: event,
            });
          });
        });
        return documents.length > 0;
      });
  }

  onFileChange($event: Event, tripId: string) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;

    console.log(files);
    if (files && files.length > 0) {
      this.router.navigate(
        [`challan-management/${this.uploadAbleTripId}/image-upload`],
        {
          state: {
            tripId: this.uploadAbleTripId,
            addedTripDocument: files,
            imageType: [
              { value: '1', viewValue: 'Unloading Challan' },
              { value: '2', viewValue: 'Loading Challan' },
            ],
            expiryAvailable: false,
            noteAvailable: true,
            returnUrl: '/challan-management',
          },
        }
      );
    }
  }

  getLoadingPointsName(tripPoints: TripPoint[]) {
    return tripPoints.filter(point => point.pointType === 'Loading');
  }

  getUnloadingPointsName(tripPoints: TripPoint[]) {
    return tripPoints.filter(point => point.pointType === 'Unloading');
  }

  protected readonly localStorage = localStorage;
  uploadAbleTripId: any;

  onClickClearCompany() {
    this.customerCode = '';
    this.searchValue = '';
    this.searchName = '';
    this.page = 0;
    this.size = 30;
    this.searchFilter = 0;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickClearTruck() {
    this.truckRegistrationId = '';
    this.searchRegistationId = '';
    this.truckRegSuggestions = [];
    this.truckFilter = 0;
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
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
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  onClickClearTripId() {
    this.tripId = '';
    this.searchId = '';
    this.tripIdSuggestions = [];
    this.tripFilter = 0;
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

  protected readonly Math = Math;
}
