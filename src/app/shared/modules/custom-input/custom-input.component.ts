import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CustomInputSelectModel} from "./custom-input-select.model";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    NgSelectModule,
    FormsModule
  ],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss'
})
export class CustomInputComponent implements OnInit {
  @Input() inputPlaceholder: string;
  @Output() selectedId: EventEmitter<number> = new EventEmitter();
  @Output() isItemsOpened: EventEmitter<boolean> = new EventEmitter();
  @Input() options: CustomInputSelectModel[] = [];
  @Input() itemsOpened: boolean = false;
  @Input() customOpened: any;
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  days: number[] = Array.from({length: 31}, (_, i) => i + 1);
  years: number[] = Array.from({length: new Date().getFullYear() - 1980 + 1}, (_, i) => 1980 + i);
  selectedFromMonth: string; // Default selected month
  selectedFromDay: number; // Default selected day
  selectedFromYear: number; // Default selected year
  selectedToMonth: string; // Default selected month
  selectedToDay: number; // Default selected day
  selectedToYear: number; // Default selected year
  selectedFromMonthInString: string;
  selectedToMonthInString: string;

  onFromMonthChange(month: string) {
    switch (month) {
      case 'January':
        this.selectedFromMonthInString = 'January';
        this.selectedFromMonth = '1';
        break;
      case 'February':
        this.selectedFromMonthInString = 'February';
        this.selectedFromMonth = '2';
        break;
      case 'March':
        this.selectedFromMonthInString = 'March';
        this.selectedFromMonth = '3';
        break;
      case 'April':
        this.selectedFromMonthInString = 'April';
        this.selectedFromMonth = '4';
        break;
      case 'May':
        this.selectedFromMonthInString = 'May';
        this.selectedFromMonth = '5';
        break;
      case 'June':
        this.selectedFromMonthInString = 'June';
        this.selectedFromMonth = '6';
        break;
      case 'July':
        this.selectedFromMonthInString = 'July';
        this.selectedFromMonth = '7';
        break;
      case 'August':
        this.selectedFromMonthInString = 'August';
        this.selectedFromMonth = '8';
        break;
      case 'September':
        this.selectedFromMonthInString = 'September';
        this.selectedFromMonth = '9';
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
    this.selectedFromDay = day;
  }

  onFromYearChange(year: number) {
    this.selectedFromYear = year;
  }

  onToMonthChange(month: string) {
    switch (month) {
      case 'January':
        this.selectedToMonthInString = 'January';
        this.selectedToMonth = '1';
        break;
      case 'February':
        this.selectedToMonthInString = 'February';
        this.selectedToMonth = '2';
        break;
      case 'March':
        this.selectedToMonthInString = 'March';
        this.selectedToMonth = '3';
        break;
      case 'April':
        this.selectedToMonthInString = 'April';
        this.selectedToMonth = '4';
        break;
      case 'May':
        this.selectedToMonthInString = 'May';
        this.selectedToMonth = '5';
        break;
      case 'June':
        this.selectedToMonthInString = 'June';
        this.selectedToMonth = '6';
        break;
      case 'July':
        this.selectedToMonthInString = 'July';
        this.selectedToMonth = '7';
        break;
      case 'August':
        this.selectedToMonthInString = 'August';
        this.selectedToMonth = '8';
        break;
      case 'September':
        this.selectedToMonthInString = 'September';
        this.selectedToMonth = '9';
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
    this.selectedToDay = day;
  }

  onToYearChange(year: number) {
    this.selectedToYear = year;
  }

  combineFromIntoSingleDate() {
    return `${this.selectedFromDay}-${this.selectedFromMonth}-${this.selectedFromYear}`;
  }

  combineToIntoSingleDate() {
    return `${this.selectedToDay}-${this.selectedToMonth}-${this.selectedToYear}`;
  }

  @Output() selectedFromDate: EventEmitter<string> = new EventEmitter();
  @Output() selectedToDate: EventEmitter<string> = new EventEmitter();
  @Output() selectedFromDateToToDate: EventEmitter<string> = new EventEmitter();
  @Input() inputSearch: string = '';


  ngOnInit(): void {

  }

  onClickOption(id: number) {
    this.selectedId.emit(id);
    this.itemsOpened = id === 99;
    this.isItemsOpened.emit(this.itemsOpened);
  }

  onClickApply() {
    this.selectedFromDate.emit(this.combineFromIntoSingleDate());
    this.selectedToDate.emit(this.combineToIntoSingleDate());
    this.selectedFromDateToToDate.emit(`${this.combineFromIntoSingleDate()} to ${this.combineToIntoSingleDate()}`);
    this.customOpened = false;
    this.itemsOpened = false;
  }
}
