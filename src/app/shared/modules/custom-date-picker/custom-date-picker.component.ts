import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { GetOutsideModalClickDirective } from '../../directive/get-outside-modal-click.directive';

@Component({
  selector: 'app-custom-date-picker',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './custom-date-picker.component.html',
  styleUrl: './custom-date-picker.component.scss',
})
export class CustomDatePickerComponent implements OnInit {
  isCalendarVisible = false;
  selectedDate: Date | null = null;
  minDate: Date = new Date();
  maxDate: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: (Date | null)[] = [];
  daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  showYearSelector = false;
  selectedYear: number = this.currentMonth.getFullYear();

  ngOnInit(): void {
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1); // Set max date to one year from today
    this.generateCalendar();
    this.getSelectedYear();
  }

  toggleCalendar(): void {
    this.isCalendarVisible = !this.isCalendarVisible;
    this.showYearSelector = false; // Hide year selector initially
  }

  toggleYearSelector(): void {
    this.showYearSelector = !this.showYearSelector;
  }

  generateCalendar(): void {
    const start = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      1
    );
    const end = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      0
    );

    const dates: (Date | null)[] = [];

    // Fill in the blanks for the first week
    for (let i = 0; i < start.getDay(); i++) {
      dates.push(null);
    }

    // Add the dates of the month
    for (let i = 1; i <= end.getDate(); i++) {
      const date = new Date(this.selectedYear, this.currentMonth.getMonth(), i);
      dates.push(date);
    }

    // Fill in the blanks for the last week
    while (dates?.length % 7 !== 0) {
      dates.push(null);
    }

    this.calendarDays = dates;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1?.getTime() === date2?.getTime();
  }

  isDisabled(date: Date): boolean {
    return date < this.minDate;
  }

  selectDate(date: Date): void {
    if (this.isDisabled(date)) {
      return;
    }
    this.selectedDate = date;
    this.isCalendarVisible = false;
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.selectedYear,
      this.currentMonth.getMonth() - 1,
      1
    );
    this.selectedYear = this.currentMonth.getFullYear();
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.selectedYear = this.currentMonth.getFullYear();
    this.generateCalendar();
  }

  changeYear(year: string): void {
    // change the year and current month also to the selected year
    this.currentMonth = new Date(+year, this.currentMonth.getMonth(), 1);
    this.selectedYear = +year;
    this.generateCalendar();
  }

  get years(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, index) => currentYear - 5 + index);
  }

  private getSelectedYear() {
    this.selectedYear = this.currentMonth.getFullYear();
  }
}
