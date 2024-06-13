import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {TripService} from "./services/trip.service";
import {CustomInputComponent} from "../../shared/modules/custom-input/custom-input.component";
import {DateEnum} from "./Enum/date.enum";
import {CustomInputSelectModel} from "../../shared/modules/custom-input/custom-input-select.model";
import {ButtonChipsComponent} from "./modules/button-chips/button-chips.component";
import {ScrollByButtonDirective} from "../../shared/directive/scroll-by-button.directive";
import {GetElementHeightDirective} from "../../shared/directive/get-element-height.directive";
import {GiveMaxHeightDirective} from "../../shared/directive/give-max-height.directive";
import {GetClickEventDirective} from "../../shared/directive/get-click-event.directive";
import {statusButtons} from "./models/status-buttons";
import {LoadingComponent} from "../../shared/modules/loading/loading.component";
import {CustomerService} from "../profiles/services/customer.service";

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
    LoadingComponent
  ],
  templateUrl: './trip-list.component.html',
  styleUrl: './trip-list.component.scss'
})
export class TripListComponent implements OnInit {
  filterOpened: boolean = false;
  filterForm: FormGroup;
  isDateOpened: boolean = false;
  tripList: any[] = [];
  inputPlaceholder: string = '';
  dateOptionArray: CustomInputSelectModel[] = []
  searchValue: string;
  from: string;
  to: string;
  status: string;
  tripSuggestions: any;
  isSearchedMenuOpened: boolean = false;
  searchName: string;
  dateFilter: number = 0;
  searchFilter: number = 0;
  summary = {
    trips: 0,
    trs: 0,
    crs: 0,
    gps: 0

  };
  statusButtons = statusButtons;
  rightButtonClicked: boolean;
  leftButtonClicked: boolean;
  right: string = '0px'
  height: string = '0px';
  scrollable: boolean = true;
  dateOpened: boolean = false;
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private service: TripService,
    private datePipe: DatePipe,
    private customer: CustomerService
    ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.getTripList();
    this.generateDateOptionsArray();
    this.getTripSummary();
    this.getTripCount()
  }

  private getTripList() {
    this.loading = true;
    // get trip list
    this.service.getTrips().subscribe((trip: any) => {
      this.tripList = trip.data;
      this.loading = false;
    });
  }

  onSelectDate($event: number) {
    this.dateFilter = 1;
// handle date selection
    if ($event === DateEnum.Custom) {
      this.isDateOpened = true;
    } else {
      this.isDateOpened = false;
      this.inputPlaceholder = this.dateOptionArray.find(x => x.id === $event)?.value;
      this.dateOptionArray.forEach(x => x.selected = x.id === $event);
      switch ($event) {
        case DateEnum.LastSevenDays:
          this.from = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
          this.to = new Date().toISOString();
          this.from = this.datePipe.transform(this.from, 'dd-MM-yyyy');
          this.to = this.datePipe.transform(this.to, 'dd-MM-yyyy');
          break;
        case DateEnum.LastFifteenDays:
          this.from = new Date(new Date().setDate(new Date().getDate() - 15)).toISOString();
          this.to = new Date().toISOString();
          this.from = this.datePipe.transform(this.from, 'dd-MM-yyyy');
          this.to = this.datePipe.transform(this.to, 'dd-MM-yyyy');
          break;
        case DateEnum.LastThirtyDays:
          this.from =
            new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
          this.to = new Date().toISOString();
          this.from = this.datePipe.transform(this.from, 'dd-MM-yyyy');
          this.to = this.datePipe.transform(this.to, 'dd-MM-yyyy');
          break;
      }
      this.onSearch();
    }
  }

  private generateDateOptionsArray() {
    // generate date options array
    this.dateOptionArray = [
      {id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false},
      {id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false},
      {id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false},
      {id: DateEnum.Custom, value: 'Custom', selected: false}
    ]
  }

  onSearch() {
    this.loading = true;
    // handle search
    this.tripList = [];
    this.service.getTrips(this.searchValue, this.from, this.to, this.status).subscribe((trip: any) => {
      this.tripList = trip.data;
      this.loading = false;
    });
  }

  onKeyUpSearch($event: any) {
    if ($event.target.value.length > 0) {
      this.tripSuggestions = [];
      this.customer.searchCustomer($event.target.value, null).subscribe((company: any) => {
        this.tripSuggestions = company.data;
        this.isSearchedMenuOpened = true;
        this.searchFilter = 1;
      });
    } else {
      this.isSearchedMenuOpened = false;
      this.searchValue = '';
      this.getTripList();
      this.searchFilter = 0;
    }
  }

  onSelectedToDate($event: string) {
    this.filterForm.get('startDate').setValue($event);
    this.from = this.filterForm.get('startDate').value;
    this.to = this.filterForm.get('endDate').value;
    this.onSearch();
  }

  onSelectedFromDate($event: string) {
    this.filterForm.get('endDate').setValue($event);
  }

  onClickSearchSuggestion(result: any) {
    this.searchValue = result.customerCode.toLowerCase();
    this.searchName = result.name;
    this.tripSuggestions = [];
    this.isSearchedMenuOpened = false;
    this.onSearch();
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
    this.statusButtons.forEach(x => x.isActive = x.name === tripStatus);
    this.searchValue = '';
    this.from = '';
    this.to = '';
    this.onSearch();
  }

  onClickRightButton() {
    this.rightButtonClicked = true;
    this.leftButtonClicked = false;
  }

  onClickLeftButton() {
    this.leftButtonClicked = true;
    this.rightButtonClicked = false;
  }

  private getTripCount() {
    this.service.getTripStatusCounts().subscribe((trip: any) => {
      this.statusButtons.forEach(x => {
        x.count = trip[x.name] ?? 0;
      });
    });
  }

  private getTripSummary() {
    this.service.getSummary().subscribe((trip: any) => {
      this.summary.trips = trip.trips;
      this.summary.trs = trip.trs;
      this.summary.crs = trip.crs;
      this.summary.gps = trip.gps;
    });
  }

  getCountOfGp(trip: any) {
    if (trip.customerRate && trip.transporterRate) {
      return trip.customerRate - trip.transporterRate;
    } else {
      return 'N/A';
    }
  }
}
