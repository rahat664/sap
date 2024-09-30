import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { VehicleTracker } from '../../driver/models/tracker.model';
import { TrackerService } from '../../../services/tracker.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [NgForOf, MatCheckbox, NgIf, NgSelectModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  truckList: VehicleTracker[] = [];
  truckerList: any[] = [];
  dateSelection: boolean;
  selectedFromMonthInString: any;
  months: any[] = [
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
  selectedFromDay: any;
  days: any[] = Array.from({ length: 31 }, (_, i) => i + 1);
  selectedFromYear: any;
  years: any[] = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => 1980 + i
  ).reverse();
  selectedToMonthInString: any;
  selectedToDay: any;
  selectedToYear: any;
  selectedFromMonth: string;
  selectedToMonth: string;

  constructor(private service: TrackerService) {}

  onClose() {}

  ngOnInit(): void {
    this.truckList = [];
    this.getTruckList();
  }

  private getTruckList() {
    this.service.getTrackers(0, 100).subscribe((res: any) => {
      this.truckList = res.data.content;
    });
  }

  onChange($event: MatCheckboxChange, truck: VehicleTracker) {
    if ($event.checked) {
      this.truckerList.push(truck.vehicleId);
    }
  }

  onGenerateReport() {
    this.dateSelection = true;
  }

  onSelectTruck() {
    this.dateSelection = true;
  }

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
}
