import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusCardComponent } from './status-card/status-card.component';
import { DashboardService } from '../../services/dashboard.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  customerStats,
  DashboardStatsModel, userStats,
} from '../../models/dashboard-stats.model';
import { RouterLink } from '@angular/router';
import {NumberSeperatorPipe} from "../../../../shared/pipes/number-seperator.pipe";

@Component({
  selector: 'app-status-heighlight',
  standalone: true,
  imports: [
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    StatusCardComponent,
    RouterLink,
    DecimalPipe,
    NumberSeperatorPipe,
  ],
  templateUrl: './status-heighlight.component.html',
  styleUrl: './status-heighlight.component.scss',
})
export class StatusHeighlightComponent {
  fromDate: string;
  toDate: string;
  dashboardStats: DashboardStatsModel;
  customerStatistics: customerStats;
  transporterStatistics: userStats;
  driverStatistics: userStats;

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.countFromDateAndToDate();
    this.getDashboardStats();
    this.customerStats();
  }

  private getDashboardStats() {
    this.service
      .getApiStats(this.fromDate, this.toDate)
      .subscribe((res: any) => {
        if (res.status === 'OK') {
          this.dashboardStats = res.data;
        }
      });
  }

  private customerStats() {
    this.service
      .getCustomerStats(this.fromDate, this.toDate)
      .subscribe((res: any) => {
        if (res.status === 'OK') {
          this.customerStatistics = res.data;
          this.transporterStatistics = res.data.totalUsers.find(
            user => user.roleName === 'ROLE_TRANSPORTER'
          );
          this.driverStatistics = res.data.totalUsers.find(
            user => user.roleName === 'ROLE_DRIVER'
          );
        }
      });
  }

  private countFromDateAndToDate() {
    // from date will be the starting date of the current month
    this.fromDate = this.datePipe.transform(new Date(), 'yyyy-MM-01');
    // to date will be the last date of the current month
    this.toDate = this.datePipe.transform(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      'yyyy-MM-dd'
    );
  }

  protected readonly localStorage = localStorage;
}
