import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {TripService} from "./services/trip.service";
import {CustomInputComponent} from "../../shared/modules/custom-input/custom-input.component";
import {DateEnum} from "./Enum/date.enum";
import {CustomInputSelectModel} from "../../shared/modules/custom-input/custom-input-select.model";

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
    FormsModule
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

  constructor(private formBuilder: FormBuilder, private service: TripService, private datePipe: DatePipe) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.getTripList();
    this.generateDateOptionsArray();
  }

  private getTripList() {
    // get trip list
    this.service.getTrips().subscribe((trip: any) => {
      this.tripList = trip.data;
    });
  }

  onSelectDate($event: number) {
// handle date selection
    if ($event === DateEnum.Custom) {
      this.isDateOpened = true;
    } else {
      this.isDateOpened = false;
      this.inputPlaceholder = this.dateOptionArray.find(x => x.id === $event)?.value;
      this.dateOptionArray.forEach(x => x.selected = x.id === $event);
      switch ($event) {
        case DateEnum.Today:
          this.from = new Date().toISOString();
          this.to = new Date().toISOString();
          this.from = this.datePipe.transform(this.from, 'dd-MM-yyyy');
          this.to = this.datePipe.transform(this.to, 'dd-MM-yyyy');
          break;
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
      {id: DateEnum.Today, value: 'Today', selected: false},
      {id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false},
      {id: DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false},
      {id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false},
      {id: DateEnum.Custom, value: 'Custom', selected: false}
    ]
  }

  onSearch() {
    // handle search
    this.tripList = [];
    this.service.getTrips(this.searchValue, this.from, this.to, this.status).subscribe((trip: any) => {
      this.tripList = trip.data;
    });
  }

  onKeyUpSearch($event: any) {
    this.service.getTripSuggestions($event.target.value).subscribe((trip: any) => {
      this.tripSuggestions = trip;
      this.isSearchedMenuOpened = true;
    });
  }

  onSelectedToDate($event: string) {
    this.filterForm.get('startDate').setValue($event);
  }

  onSelectedFromDate($event: string) {
    this.filterForm.get('endDate').setValue($event);
  }

  onClickSearchSuggestion(result: any) {
    this.searchValue = result.tripId.toLowerCase();
    this.searchName = result.customerName
    this.tripSuggestions = [];
    this.isSearchedMenuOpened = false;
    this.onSearch();
  }
}
