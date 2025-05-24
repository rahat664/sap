import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
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
import { PaymentType, TripType } from '../../shared/Enums/payment-type';
import {
  ChallanDashboardFilterComponent
} from './components/challan-dashboard-filter/challan-dashboard-filter.component';

@Component({
  selector: 'app-challan-dashboard',
  imports: [
    DatePipe,
    FormsModule,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    LoadingComponent,
    NgForOf,
    NgIf,
    NgClass,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
    numberPipe,
    ChallanDashboardFilterComponent,
  ],
  templateUrl: './challan-dashboard.component.html',
  styleUrl: './challan-dashboard.component.scss',
})
export class ChallanDashboardComponent implements OnInit, AfterViewInit {
  private dateFilter = 0;
  private searchFilter = 0;
  private tripFilter = 0;
  private customerCode: any[] = [];
  private to: string;
  private from: string;
  searchValue: string;
  filterForm: FormGroup;
  protected truckRegistrationId: string;
  protected transporterName: string;
  private transporterFilter = 0;
  private truckFilter = 0;
  protected truckRegSuggestions: any[] = [];
  protected transporterSuggestions: any[];
  searchRegistationId: any;
  searchTransporter: any;
  searchId: any;
  protected readonly Math = Math;
  paymentTypePlaceholder: string = '';
  paymentTypeValue: string = '';
  paymentFilter: number = 0;
  paymentTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'CASH', selected: false, showname: 'Cash' },
    { id: 2, value: 'INVOICE', selected: false, showname: 'Invoice' },
    {
      id: 3,
      value: 'CASH_AND_INVOICE',
      selected: false,
      showname: 'Cash & Invoice',
    },
    { id: 4, value: 'COMMISSION', selected: false, showname: 'Commission' },
  ];
  tripTypeFilter: number = 0;
  tripTypeValue: string = '';
  filterData: any = {};
  filterApplied: boolean = false;
   truckType: any[] = [];

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
  filterOpened = false;
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
  }


  ngOnInit() {
    localStorage.removeItem('tripFilterData');
    this.activatedChallanStatus = 'Completed';
    this.chalanStatus = '';
    this.status = 'Completed';
    this.getFromDateAndToDate();
    this.loading = true;
    this.anotherStatusCalled = false;
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
        this.customerCode?.toString(),
        null,
        null,
        this.status,
        this.tripId,
        this.truckType?.toString(),
        null,
        this.chalanStatus,
        this.challanHardCopyReceived,
        this.from,
        this.to,
        this.truckRegistrationId,
        this.transporterName,
        this.paymentTypeValue?.toString(),
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
      return 'Not found';
    }
  }

  getBgColor(challanStatus: string, type: string) {
    switch (challanStatus) {
      case 'Pending':
        return type === 'bg' ? 'bg-[#E9FCFE]' : 'text-[#066A78]';
      case 'Approved':
        return type === 'bg' ? 'bg-[#D7F0E4]' : 'text-[#087D46]';
      case 'Rejected':
        return type === 'bg' ? 'bg-[#FFE2DD]' : 'text-[#961801]';
      case 'In-Progress':
        return type === 'bg' ? 'bg-[#FFEED1]' : 'text-[#D38704]';
      default:
        return type === 'bg' ? 'bg-[#FCF5E9]' : 'text-[#D38704]';
    }
  }

  checkDueDays(trip: Trip) {
    const tripCompletedDate = new Date(trip.tripEndedAt);

    if (trip.challanStatus === 'Pending') {
      const currentDate = new Date();
      // set tripCompletedDate to 12:00:00 AM and currentDate to 12:00:00 AM
      tripCompletedDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(
        currentDate.getTime() - tripCompletedDate.getTime()
      );
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      if (trip.firstChallanUploadedDate || trip.challanStatusUpdatedAt) {
        // set tripCompletedDate to 12:00:00 AM
        tripCompletedDate.setHours(0, 0, 0, 0);
        if (trip.firstChallanUploadedDate) {
          const firstChallanUploadedDate = new Date(
            trip.firstChallanUploadedDate
          );
          // set firstChallanUploadedDate to 12:00:00 AM
          firstChallanUploadedDate.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(
            firstChallanUploadedDate.getTime() - tripCompletedDate.getTime()
          );
          return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        } else {
          const challanStatusUpdatedDate = new Date(
            trip.challanStatusUpdatedAt
          );
          // set challanStatusUpdatedDate to 12:00:00 AM
          challanStatusUpdatedDate.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(
            challanStatusUpdatedDate.getTime() - tripCompletedDate.getTime()
          );
          return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
      } else {
        // set tripCompletedDate to 12:00:00 AM and currentDate to 12:00:00 AM
        const currentDate = new Date();
        const diffTime = Math.abs(
          currentDate.getTime() - tripCompletedDate.getTime()
        );
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
    }

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



  onClickTruckSearchSuggestion(result: any) {
    this.chalanStatus = '';
    this.status = 'Completed';
    this.activatedChallanStatus = 'Completed';
    this.truckFilter = 1;
    this.page = 0;
    this.truckRegistrationId = result.fullRegistrationNumber;
    this.searchRegistationId = result.fullRegistrationNumber;
    this.truckRegSuggestions = [];
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
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

  onFileChange($event: Event, tripId: string) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
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
  tripTypePlaceholder: string = '';
  tripTypeOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'PROJECT', selected: false, showname: 'Project Logistics' },
    {
      id: 2,
      value: 'COMMERCIAL',
      selected: false,
      showname: 'Commercial Logistics',
    },
  ];

  onClickClearCompany() {
    this.customerCode = [];
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

  onSelectPayment($event: number) {
    this.paymentFilter = 1;
    this.paymentTypeOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.paymentTypePlaceholder =
      this.paymentTypeOptionsArray.find(x => x.id === $event)?.showname || '';
    this.paymentTypeValue =
      this.paymentTypeOptionsArray.find(x => x.id === $event)?.value || '';
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }
  onSelectTrip($event: number) {
    this.tripTypeFilter = 1;
    this.tripTypeOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.tripTypePlaceholder =
      this.tripTypeOptionsArray.find(x => x.id === $event)?.showname || '';
    this.tripTypeValue =
      this.tripTypeOptionsArray.find(x => x.id === $event)?.value || '';
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.trip.anotherStatusCalled.next(true);
    this.getTripList();
  }

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

  checkReceivedDays(trip: Trip) {
    if (trip.firstChallanUploadedDate || trip.challanStatusUpdatedAt) {
      if (trip.firstChallanUploadedDate) {
        const firstChallanUploadedDate = new Date(
          trip.firstChallanUploadedDate
        );
        return this.datePipe.transform(
          firstChallanUploadedDate,
          'dd MMM,yyyy h:mm a'
        );
      } else {
        const challanStatusUpdatedDate = new Date(trip.challanStatusUpdatedAt);
        return this.datePipe.transform(
          challanStatusUpdatedDate,
          'dd MMM,yyyy h:mm a'
        );
      }
    } else {
      return 'N/A';
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

  onFilterData($event: any) {
    this.filterData = $event;
  }

  onFilterApply() {
    if (
      this.filterData?.startDate ||
      this.filterData?.endDate ||
      this.filterData?.paymentType?.length > 0 ||
      this.filterData?.tripType?.length > 0 ||
      this.filterData?.customerCode?.length > 0 ||
      this.filterData?.truckType?.length > 0 ||
      this.filterData?.tripId ||
      this.filterData?.transporterName ||
      this.filterData?.truckRegistrationId
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
      this.paymentTypeValue = this.filterData.paymentType?.toString();
      this.tripTypeValue = this.filterData.tripType?.toString();
      this.truckRegistrationId = this.filterData.truckRegistrationId;
      this.page = 0;
      this.size = 30;
      this.loading = true;
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

  onClickFilterOpen() {
    this.filterOpened = true
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
    if (this.filterData?.paymentType?.length > 0)
      parts.push(`Payment Type: <b>${this.filterData.selectedPaymentValue?.toString()}</b>`);
    if (this.filterData?.tripType?.length > 0)
      parts.push(`Trip type: <b>${this.filterData.selectedTripValue?.toString()}</b>`);
    if (this.filterData.tripId)
      parts.push(`Trip ID: <b>${this.filterData.tripId}</b>`);
    if (this.filterData?.customerCode?.length > 0) {
      parts.push(`Company: <b>${this.filterData.customerName?.toString()}</b>`);
    }
    if (this.filterData?.truckType?.length > 0) {
      parts.push(`Truck Type: <b>${this.filterData.selectedTruckValues?.toString()}</b>`);
    }
    if (this.filterData.truckRegistrationId) {
      parts.push(
        `Truck Registration ID: <b>${this.filterData.truckRegistrationId}</b>`
      );
    }
    return parts.join(', ');
  }

  onCLickClearAll() {
    this.filterOpened = false;
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
    this.truckRegistrationId = '';
    this.from = '';
    this.to = '';
    this.filterForm.reset();
    localStorage.removeItem('tripFilterData');
    this.getTripList();
  }
}
