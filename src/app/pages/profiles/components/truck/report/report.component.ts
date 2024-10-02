import { Component } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { VehicleTracker } from '../../driver/models/tracker.model';
import { TrackerService } from '../../../services/tracker.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { MatDialogRef } from '@angular/material/dialog';
import { timer } from 'rxjs';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    NgForOf,
    MatCheckbox,
    NgIf,
    NgSelectModule,
    FormsModule,
    DatePipe,
    NgClass,
  ],
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
    (_, i) => 1980 + i,
  ).reverse();
  selectedToMonthInString: any;
  selectedToDay: any;
  selectedToYear: any;
  selectedFromMonth: string;
  selectedToMonth: string;
  dates: any[] = [
    { value: 'Today', selected: true },
    {
      value: 'Last 7 days',
      selected: false,
    },
    { value: 'Last 15 days' },
    { value: 'Last 30 days', selected: false },
    { value: 'Custom', selected: false },
  ];
  fromDate: string;
  toDate: string;
  loading: boolean;
  truckerNameList: any[] = [];
  cashedReport: any;
  cashedReportOpened: boolean;
  truckSelection: boolean;
  processing: boolean;

  constructor(
    private service: TrackerService,
    private datePipe: DatePipe,
    private toast: HandleToastrService,
    private matRef: MatDialogRef<ReportComponent>,
  ) {
  }

  onClose() {
    this.matRef.close();
  }

  ngOnInit(): void {
    if (localStorage.getItem('cashedReport')) {
      this.cashedReport = JSON.parse(localStorage.getItem('cashedReport'));
      this.cashedReportOpened = true;
    } else {
      this.cashedReportOpened = false;
      this.truckSelection = true;
    }
    this.truckList = [];
    // set today's date as default
    this.fromDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.toDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.setDateValues(new Date(), new Date());
    this.getTruckList();
  }

  private getTruckList() {
    this.loading = true;
    this.service.getTrackers(0, 100).subscribe((res: any) => {
      this.loading = false;
      this.truckList = res.data.content;
    });
  }

  onChange($event: MatCheckboxChange, truck: VehicleTracker) {
    if ($event.checked) {
      this.truckerList.push(truck.vehicleId);
      this.truckerNameList.push(truck.vehicleRegistrationNumber);
    }
  }

  onGenerateReport() {
    if (this.fromDate && this.toDate) {
      if (localStorage.getItem('cashedReport')) {
        const cashedReport = JSON.parse(localStorage.getItem('cashedReport'));
        const truckerList = this.truckerList.join(',');
        cashedReport.push({
          fromDate: this.fromDate,
          toDate: this.toDate,
          truckerList: truckerList,
          truckerNameList: this.truckerNameList.join(','),
          processed: false,
          processing: false,
        });
        localStorage.setItem('cashedReport', JSON.stringify(cashedReport));
      } else {
        const cashedReport = [
          {
            fromDate: this.fromDate,
            toDate: this.toDate,
            truckerList: this.truckerList.join(','),
            truckerNameList: this.truckerNameList.join(','),
            processed: false,
            processing: false,
          },
        ];
        localStorage.setItem('cashedReport', JSON.stringify(cashedReport));
      }
      this.matRef.close();
      this.service
        .downReport(this.fromDate, this.toDate, this.truckerList.join(','))
        .subscribe(
          (res: any) => {
            this.dateSelection = false;
            this.toast.showSuccess(
              'Report generated successfully. Please wait a moment for the download to start.',
            );
          },
          error => {
            this.dateSelection = false;
            this.toast.showError('Failed to generate report');
          },
        );
    } else {
      this.toast.showError('Please select date range');
    }
  }

  clearCache() {
    localStorage.removeItem('cashedReport');
    this.cashedReport = null;
    this.cashedReportOpened = false;
    this.dateSelection = false;
    this.truckSelection = true;
  }

  onDownloadReport(fromDate: string, toDate: string, truckerList: string, truckerNameList: any, processed: any, processing: any) {
    this.processing = true;
    if (processed) {
      this.processing = false;
      this.service
        .downReport(fromDate, toDate, truckerList)
        .subscribe(
          (res: any) => {
            const url = window.URL.createObjectURL(res);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `Report_${fromDate}_${toDate}_${truckerNameList}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          },
          error => {
            this.toast.showError('Failed to download report');
          },
        );
    } else {
      this.cashedReport.forEach(report => {
        if (report.fromDate === fromDate && report.toDate === toDate && report.truckerList === truckerList) {
          report.processing = true;
        }
      });
      timer(60000).subscribe(() => {
        this.cashedReport.forEach(report => {
          if (report.fromDate === fromDate && report.toDate === toDate && report.truckerList === truckerList) {
            report.processing = false;
            report.processed = true;
          }
        });
        localStorage.setItem('cashedReport', JSON.stringify(this.cashedReport));
        this.service
          .downReport(fromDate, toDate, truckerList)
          .subscribe(
            (res: any) => {
              const url = window.URL.createObjectURL(res);
              const a = document.createElement('a');
              document.body.appendChild(a);
              a.style.display = 'none';
              a.href = url;
              a.download = `Report_${fromDate}_${toDate}_${truckerNameList}.pdf`;
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            },
            error => {
              this.toast.showError('Failed to download report');
            },
          );
      });
    }
  }

  onSelectDate() {
    if (this.truckerList.length > 0) {
      this.dateSelection = true;
    } else {
      this.toast.showError('Please select at least one truck');
    }
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
    if (
      this.selectedFromDay &&
      this.selectedFromMonth &&
      this.selectedFromYear
    ) {
      this.fromDate = `${this.selectedFromYear}-${this.selectedFromMonth}-${this.selectedFromDay}`;
    } else {
      this.fromDate = null;
    }
  }

  onFromDayChange(day: number) {
    this.selectedFromDay =
      day.toString()?.length === 1 ? `0${day}` : day.toString();
    if (
      this.selectedFromDay &&
      this.selectedFromMonth &&
      this.selectedFromYear
    ) {
      this.fromDate = `${this.selectedFromYear}-${this.selectedFromMonth}-${this.selectedFromDay}`;
    } else {
      this.fromDate = null;
    }
  }

  onFromYearChange(year: number) {
    this.selectedFromYear = year.toString();
    if (
      this.selectedFromDay &&
      this.selectedFromMonth &&
      this.selectedFromYear
    ) {
      this.fromDate = `${this.selectedFromYear}-${this.selectedFromMonth}-${this.selectedFromDay}`;
    } else {
      this.fromDate = null;
    }
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
    if (this.selectedToDay && this.selectedToMonth && this.selectedToYear) {
      this.toDate = `${this.selectedToYear}-${this.selectedToMonth}-${this.selectedToDay}`;
    } else {
      this.toDate = null;
    }
  }

  onToDayChange(day: number) {
    this.selectedToDay =
      day.toString()?.length === 1 ? `0${day}` : day.toString();
    if (this.selectedToDay && this.selectedToMonth && this.selectedToYear) {
      this.toDate = `${this.selectedToYear}-${this.selectedToMonth}-${this.selectedToDay}`;
    } else {
      this.toDate = null;
    }
  }

  onToYearChange(year: number) {
    this.selectedToYear = year.toString();
    if (this.selectedToDay && this.selectedToMonth && this.selectedToYear) {
      this.toDate = `${this.selectedToYear}-${this.selectedToMonth}-${this.selectedToDay}`;
    } else {
      this.toDate = null;
    }
  }

  private setDateValues(fromDate: Date, toDate: Date) {
    if (fromDate && toDate) {
      this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd');
      this.toDate = this.datePipe.transform(toDate, 'yyyy-MM-dd');
      this.selectedFromDay =
        fromDate.getDate() < 10 ? `0${fromDate.getDate()}` : fromDate.getDate();
      this.selectedFromYear = fromDate.getFullYear();
      this.selectedFromMonthInString = this.months[fromDate.getMonth()];
      this.selectedToDay =
        toDate.getDate() < 10 ? `0${toDate.getDate()}` : toDate.getDate();
      this.selectedToYear = toDate.getFullYear();
      this.selectedToMonthInString = this.months[toDate.getMonth()];
    } else {
      this.fromDate = null;
      this.toDate = null;
      this.selectedFromDay = null;
      this.selectedFromYear = null;
      this.selectedFromMonthInString = null;
      this.selectedToDay = null;
      this.selectedToYear = null;
      this.selectedToMonthInString = null;
    }
  }

  onClickButton(button: any) {
    switch (button.value) {
      case 'Today':
        const today = new Date();
        this.setDateValues(today, today);
        break;
      case 'Last 7 days':
        const last7DaysFrom = new Date(
          new Date().setDate(new Date().getDate() - 7),
        );
        const last7DaysTo = new Date(
          new Date().setDate(new Date().getDate() - 1),
        );
        this.setDateValues(last7DaysFrom, last7DaysTo);
        break;
      case 'Last 15 days':
        const last15DaysFrom = new Date(
          new Date().setDate(new Date().getDate() - 15),
        );
        const last15DaysTo = new Date(
          new Date().setDate(new Date().getDate() - 1),
        );
        this.setDateValues(last15DaysFrom, last15DaysTo);
        break;
      case 'Last 30 days':
        const last30DaysFrom = new Date(
          new Date().setDate(new Date().getDate() - 30),
        );
        const last30DaysTo = new Date(
          new Date().setDate(new Date().getDate() - 1),
        );
        this.setDateValues(last30DaysFrom, last30DaysTo);
        break;
      case 'Custom':
        this.toDate = null;
        this.fromDate = null;
        this.setDateValues(null, null);
        break;
    }
    this.dates.forEach(date => {
      date.selected = date.value === button.value;
    });
  }

  onGenerateNew() {
    this.cashedReportOpened = false;
    this.truckerList = [];
    this.truckerNameList = [];
    this.truckSelection = true;
  }
}
