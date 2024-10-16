import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ColumnChartComponent } from '../../../../shared/charts/column-chart/column-chart.component';
import { DashboardService } from '../../services/dashboard.service';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-month-wise-revenue',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    ColumnChartComponent,
  ],
  templateUrl: './month-wise-revenue.component.html',
  styleUrl: './month-wise-revenue.component.scss',
})
export class MonthWiseRevenueComponent {
  months: any[];
  fromDate: string[];
  toDate: string[];
  completedTrips: number[] = [];
  createdTrips: number[] = [];

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.getLastSixMonthNames();
    this.getLastSixMonthFromDate();
    this.getLastSixMonthToDate();
    this.getMonthWiseTripCount();
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
      lastSixMonths.push(monthNames[month]);
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
    const observables = this.fromDate.map((fromDate, index) =>
      this.service.getTripCountByStatus(fromDate, this.toDate[index])
    );
    forkJoin(observables).subscribe((responses: any[]) => {
      this.completedTrips = responses.map(res => res.data.Completed);
      this.createdTrips = responses.map(res => res.data.All);
    });
  }
}
