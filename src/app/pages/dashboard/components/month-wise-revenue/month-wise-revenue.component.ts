import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColumnChartComponent } from '../../../../shared/charts/column-chart/column-chart.component';
import { DashboardService } from '../../services/dashboard.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-month-wise-revenue',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ColumnChartComponent,
    RouterLink,
    MatFormField,
    MatOption,
    MatSelect,
  ],
  templateUrl: './month-wise-revenue.component.html',
  styleUrl: './month-wise-revenue.component.scss',
})
export class MonthWiseRevenueComponent implements OnInit {
  months: any[];
  fromDate: string[];
  toDate: string[];
  completedTrips: number[] = [];
  createdTrips: number[] = [];
  from: any;
  to: any;
  datatype: string = 'monthly';
  customerCode: string = '';

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.customerCode = params['customerCode'] ? params['customerCode'] : '';
      if (!params['fromDate'] || !params['toDate']) {
        this.getMonthWiseTripCount();
      } else {
        // count that how many months in the selected date range like 2025-01-29 to 2025-02-04 will be 2 months january and february
        const fromDate = new Date(params['fromDate']);
        const toDate = new Date(params['toDate']);
        this.from = params['fromDate'];
        this.to = params['toDate'];
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
    this.from = this.fromDate[0];
    this.to = this.toDate[this.toDate.length - 1];
  }

  private getMonthWiseTripCount() {
    // to date will be the given to date

    if (this.datatype === 'monthly') {
      this.months = [];
      this.getLastSixMonthNames();
      this.getLastSixMonthFromDate();
      this.getLastSixMonthToDate();
      this.fromDate.map((fromDate, index) => {
        // concat the form date and to date with month name like 29-31 Jan-2025
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(this.toDate[index]);

        const fromDay = this.datePipe.transform(fromDateObj, 'd'); // Get day of the month
        const toDay = this.datePipe.transform(toDateObj, 'd'); // Get day of the month
        const fromMonth = this.datePipe.transform(fromDateObj, 'MMM'); // Get month name of fromDate
        const toMonth = this.datePipe.transform(toDateObj, 'MMM'); // Get month name of toDate

        // Get the last day of the month for fromDate
        const lastDayOfFromMonth = new Date(
          fromDateObj.getFullYear(),
          fromDateObj.getMonth() + 1,
          0
        ).getDate();

        // Check if both fromDate and toDate are in the same month
        if (fromMonth === toMonth) {
          // If the fromDate is the first day and the toDate is the last day of the same month
          if (fromDay === '1' && toDay === lastDayOfFromMonth.toString()) {
            // If it's the whole month, don't add month name
            this.months[index] = `${this.months[index]}`;
          } else {
            // Otherwise, append the range with the month name
            this.months[index] = `${this.months[index]}|${fromDay} - ${toDay}`;
          }
        } else {
          // If the fromDate and toDate are in different months, append the full range
          this.months[index] = `${this.months[index]}|${fromDay} - ${toDay}`;
        }
      });
    } else  {
      this.months = [];
      // calculate days between the from and to date
      const fromDate = new Date(this.from);
      const toDate = new Date(this.to);
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      for (let i = 0; i < diffDays; i++) {
        const date = new Date(fromDate);
        date.setDate(date.getDate() + i);
        this.months.push(this.datePipe.transform(date, 'dd-MMM-yyyy'));
      }
    }

    this.service
      .getDateWiseTripCount(
        this.from,
        this.to,
        this.datatype,
        this.customerCode
      )
      .subscribe((res: any) => {
        const createdTrips = [];
        const completedTrips = [];
        this.months.forEach(month => {
          let created = 0;
          let completed = 0;
          createdTrips.push(created);
          completedTrips.push(completed);
        });
        res.data?.forEach(data => {
          const period = this.datePipe.transform(
            new Date(data.period),
            'MMM-yyyy'
          );
          const index = this.months.findIndex(month => month.includes(period));
          if (index !== -1) {
            createdTrips[index] = data.All;
            completedTrips[index] = data.Completed;
          }
        });
        this.createdTrips = createdTrips;
        this.completedTrips = completedTrips;
      });
  }

  changeType($event: any) {
    this.datatype = $event.value;
    this.getMonthWiseTripCount();
  }
}
