import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
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
    CustomInputComponent
  ],
  templateUrl: './trip-list.component.html',
  styleUrl: './trip-list.component.scss'
})
export class TripListComponent implements OnInit{
  filterOpened: boolean = false;
  filterForm: FormGroup;
  isDateOpened: boolean = false;
  dateFormOpened: boolean = false;
  tripList: any[] =[];
  inputPlaceholder: string = 'Choose Date';
  dateOptionArray: CustomInputSelectModel[] = []

  constructor(private formBuilder: FormBuilder, private service: TripService) {
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
    this.inputPlaceholder = this.dateOptionArray.find(x => x.id === $event)?.value;
    this.dateOptionArray.forEach(x => x.selected = x.id === $event);
    this.isDateOpened = false;
    if ($event === DateEnum.Custom) {
      this.dateFormOpened = true;
    }
  }

  private generateDateOptionsArray() {
    // generate date options array
    this.dateOptionArray = [
      {id: DateEnum.Today, value: 'Today', selected: false},
      {id: DateEnum.LastSevenDays, value: 'Last 7 days', selected: false},
      {id:DateEnum.LastFifteenDays, value: 'Last 15 days', selected: false},
      {id: DateEnum.LastThirtyDays, value: 'Last 30 days', selected: false},
      {id: DateEnum.Custom, value: 'Custom', selected: false}
    ]
  }
}
