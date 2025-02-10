import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ColumnChartComponent } from '../../../../shared/charts/column-chart/column-chart.component';
import { DashboardService } from '../../services/dashboard.service';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LineChartComponent } from '../../../../shared/charts/line-chart/line-chart.component';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-month-wise-revenue',
  imports: [FormsModule, ReactiveFormsModule, ColumnChartComponent, RouterLink],
  templateUrl: './month-wise-revenue.component.html',
  styleUrl: './month-wise-revenue.component.scss',
})
export class MonthWiseRevenueComponent implements OnInit {
  months: any[];
  fromDate: string[];
  toDate: string[];
  completedTrips: number[] = [];
  createdTrips: number[] = [];

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (!params['fromDate'] || !params['toDate']) {
        this.getLastSixMonthNames();
        this.getLastSixMonthFromDate();
        this.getLastSixMonthToDate();
        this.getMonthWiseTripCount();
      } else {
        // count that how many months in the selected date range like 2025-01-29 to 2025-02-04 will be 2 months january and february
        const fromDate = new Date(params['fromDate']);
        const toDate = new Date(params['toDate']);
        const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12;
        this.months = [];
        for (
          let i = fromDate.getMonth();
          i <= months + toDate.getMonth();
          i++
        ) {
          // the month name will be according to the range
          this.months.push(
            this.datePipe.transform(
              new Date(fromDate.getFullYear(), i, 1),
              'MMM-yyyy'
            )
          );
        }
        // now in the array will be 2 months january and february
        // fromdate will be 2025-01-29 and 2025-02-01
        // todate will be 2025-01-31 and 2025-02-04
        this.fromDate = [];
        this.toDate = [];
        for (let i = 0; i < this.months.length; i++) {
          // Push the fromDate for the first month or the first day of the current month in the loop
          this.fromDate.push(
            i === 0
              ? params['fromDate']
              : this.datePipe.transform(
                  new Date(fromDate.getFullYear(), fromDate.getMonth() + i, 1),
                  'yyyy-MM-dd'
                )
          );

          // Push the toDate for the last month or the last day of the current month in the loop
          this.toDate.push(
            i === this.months.length - 1
              ? params['toDate']
              : this.datePipe.transform(
                  new Date(
                    fromDate.getFullYear(),
                    fromDate.getMonth() + i + 1,
                    0
                  ),
                  'yyyy-MM-dd'
                )
          );
        }
        this.getMonthWiseTripCount();
      }
    });
  }

  private getLastSixMonthNames() {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const d = new Date();
    let month = d.getMonth();
    let year = d.getFullYear();
    const lastSixMonths = [];
    for (let i = 0; i < 6; i++) {
      lastSixMonths.push(monthNames[month] + '-' + year);
      if (month === 0) {
        month = 11;
        year--;
      } else {
        month--;
      }
    }
    this.months = lastSixMonths.reverse();
  }

  private getLastSixMonthFromDate() {
    const d = new Date();
    let month = d.getMonth();
    let year = d.getFullYear();
    const lastSixMonths = [];
    for (let i = 0; i < 6; i++) {
      lastSixMonths.push(
        this.datePipe.transform(new Date(year, month, 1), 'yyyy-MM-dd')
      );
      if (month === 0) {
        month = 11;
        year--;
      } else {
        month--;
      }
    }
    this.fromDate = lastSixMonths.reverse();
  }

  private getLastSixMonthToDate() {
    const d = new Date();
    let month = d.getMonth();
    let year = d.getFullYear();
    const lastSixMonths = [];
    for (let i = 0; i < 6; i++) {
      if (month === d.getMonth()) {
        lastSixMonths.push(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
      } else {
        lastSixMonths.push(
          this.datePipe.transform(new Date(year, month + 1, 0), 'yyyy-MM-dd')
        );
      }
      if (month === 0) {
        month = 11;
        year--;
      } else {
        month--;
      }
    }
    this.toDate = lastSixMonths.reverse();
  }

  private getMonthWiseTripCount() {
    // to date will be the given to date

    this.fromDate.map((fromDate, index) => {
      // concat the form date and to date with month name like 29-31 Jan-2025
      this.months[index] =
        this.datePipe.transform(new Date(fromDate), 'd') +
        '-' +
        this.datePipe.transform(new Date(this.toDate[index]), 'd') +
        ' ' +
        this.months[index];
    });

    const observables = this.fromDate.map((fromDate, index) =>
      this.service.getTripCountByStatus(fromDate, this.toDate[index])
    );
    forkJoin(observables).subscribe((responses: any[]) => {
      this.completedTrips = responses.map(res => res.data.Completed);
      this.createdTrips = responses.map(res => res.data.All);
    });
  }
}
