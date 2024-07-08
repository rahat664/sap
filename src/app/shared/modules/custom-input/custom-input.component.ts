import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CustomInputSelectModel } from './custom-input-select.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverEditSharedService } from '../../../pages/profiles/services/driver-edit-shared.service';
import { GetOutsideModalClickDirective } from '../../directive/get-outside-modal-click.directive';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GetOutsideModalClickDirective,
    NgSelectModule,
  ],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss',
})
export class CustomInputComponent implements OnInit {
  @Input() inputPlaceholder: string;
  @Output() selectedId = new EventEmitter<number>();
  @Output() isItemsOpened = new EventEmitter<boolean>();
  @Input() options: CustomInputSelectModel[] = [];
  itemsOpened = false;
  customOpened: any;
  @Input() isError = false;
  months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  years: number[] = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => 1980 + i
  );
  selectedFromMonth: string; // Default selected month
  selectedFromDay: string; // Default selected day
  selectedFromYear: string; // Default selected year
  // Default selected date for To date
  selectedToMonth: string =
    new Date().getMonth().toString().length === 1
      ? `0${new Date().getMonth().toString()}`
      : new Date().getMonth().toString(); // Default selected month
  selectedToDay: string =
    new Date().getDate().toString().length === 1
      ? `0${new Date().getDate().toString()}`
      : new Date().getDate().toString(); // Default selected day
  selectedToYear: string = new Date().getFullYear().toString(); // Default selected year
  selectedFromMonthInString: string;
  selectedToMonthInString: string;

  constructor(private shared: DriverEditSharedService) {}

  onFromMonthChange(month: string) {
    switch (month) {
      case 'January':
        this.selectedFromMonthInString = 'January';
        this.selectedFromMonth = '01';
        break;
      case 'February':
        this.selectedFromMonthInString = 'February';
        this.selectedFromMonth = '02';
        break;
      case 'March':
        this.selectedFromMonthInString = 'March';
        this.selectedFromMonth = '03';
        break;
      case 'April':
        this.selectedFromMonthInString = 'April';
        this.selectedFromMonth = '04';
        break;
      case 'May':
        this.selectedFromMonthInString = 'May';
        this.selectedFromMonth = '05';
        break;
      case 'June':
        this.selectedFromMonthInString = 'June';
        this.selectedFromMonth = '06';
        break;
      case 'July':
        this.selectedFromMonthInString = 'July';
        this.selectedFromMonth = '07';
        break;
      case 'August':
        this.selectedFromMonthInString = 'August';
        this.selectedFromMonth = '08';
        break;
      case 'September':
        this.selectedFromMonthInString = 'September';
        this.selectedFromMonth = '09';
        break;
      case 'October':
        this.selectedFromMonthInString = 'October';
        this.selectedFromMonth = '10';
        break;
      case 'November':
        this.selectedFromMonthInString = 'November';
        this.selectedFromMonth = '11';
        break;
      case 'December':
        this.selectedFromMonthInString = 'December';
        this.selectedFromMonth = '12';
        break;
    }
  }

  onFromDayChange(day: number) {
    this.selectedFromDay =
      day.toString()?.length === 1 ? `0${day}` : day.toString();
  }

  onFromYearChange(year: number) {
    this.selectedFromYear = year.toString();
  }

  onToMonthChange(month: string) {
    switch (month) {
      case 'January':
        this.selectedToMonthInString = 'January';
        this.selectedToMonth = '01';
        break;
      case 'February':
        this.selectedToMonthInString = 'February';
        this.selectedToMonth = '02';
        break;
      case 'March':
        this.selectedToMonthInString = 'March';
        this.selectedToMonth = '03';
        break;
      case 'April':
        this.selectedToMonthInString = 'April';
        this.selectedToMonth = '04';
        break;
      case 'May':
        this.selectedToMonthInString = 'May';
        this.selectedToMonth = '05';
        break;
      case 'June':
        this.selectedToMonthInString = 'June';
        this.selectedToMonth = '06';
        break;
      case 'July':
        this.selectedToMonthInString = 'July';
        this.selectedToMonth = '07';
        break;
      case 'August':
        this.selectedToMonthInString = 'August';
        this.selectedToMonth = '08';
        break;
      case 'September':
        this.selectedToMonthInString = 'September';
        this.selectedToMonth = '09';
        break;
      case 'October':
        this.selectedToMonthInString = 'October';
        this.selectedToMonth = '10';
        break;
      case 'November':
        this.selectedToMonthInString = 'November';
        this.selectedToMonth = '11';
        break;
      case 'December':
        this.selectedToMonthInString = 'December';
        this.selectedToMonth = '12';
        break;
    }
  }

  onToDayChange(day: number) {
    this.selectedToDay =
      day.toString()?.length === 1 ? `0${day}` : day.toString();
  }

  onToYearChange(year: number) {
    this.selectedToYear = year.toString();
  }

  combineFromIntoSingleDate() {
    return `${this.selectedFromYear}-${this.selectedFromMonth}-${this.selectedFromDay}`;
  }

  combineToIntoSingleDate() {
    return `${this.selectedToYear}-${this.selectedToMonth}-${this.selectedToDay}`;
  }

  @Output() selectedFromDate = new EventEmitter<string>();
  @Output() selectedToDate = new EventEmitter<string>();
  @Output() selectedFromDateToToDate = new EventEmitter<string>();
  @Input() inputSearch = '';
  @Input() backgroundColor = 'input';
  @Input() errorMessage: string;

  ngOnInit(): void {
    if (this.options?.length == 1) {
      this.inputPlaceholder = this.options[0].value;
      this.selectedId.emit(this.options[0].id);
    }
    this.isError = false;
    this.onToMonthChange(this.months[new Date().getMonth()]);
    this.shared.closeInputSelect.subscribe(data => {
      this.itemsOpened = data;
    });
  }

  onClickOption(id: number) {
    this.selectedId.emit(id);
    if (id === 99) {
      this.itemsOpened = true;
      this.customOpened = true;
    } else {
      this.itemsOpened = false;
    }
  }

  onClickApply() {
    this.selectedFromDate.emit(this.combineFromIntoSingleDate());
    this.selectedToDate.emit(this.combineToIntoSingleDate());
    this.selectedFromDateToToDate.emit(
      `${this.combineFromIntoSingleDate()} to ${this.combineToIntoSingleDate()}`
    );
    this.shared.closeInputSelect.next(false);
    this.itemsOpened = false;
    this.customOpened = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.options?.length == 1) {
      this.inputPlaceholder = this.options[0].value;
      this.selectedId.emit(this.options[0].id);
    }
  }
}
