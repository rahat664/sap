import { Component, Input, OnInit } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusCardComponent } from './status-card/status-card.component';
import { DashboardService } from '../../services/dashboard.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  customerStats,
  DashboardStatsModel,
  userStats,
} from '../../models/dashboard-stats.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';

@Component({
  selector: 'app-status-heighlight',
  imports: [ReactiveFormsModule, StatusCardComponent, RouterLink, numberPipe],
  templateUrl: './status-heighlight.component.html',
  styleUrl: './status-heighlight.component.scss',
})
export class StatusHeighlightComponent implements OnInit {
  fromDate: string;
  toDate: string;
  dashboardStats: DashboardStatsModel;
  customerStatistics: customerStats;
  transporterStatistics: userStats;
  driverStatistics: userStats;
  customerCode: any[];
  dateFilterAvailable: boolean;
  paymentType: string = '';
  tripType: string = '';

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // get data from query params
    this.activatedRoute.queryParams.subscribe((params) => {
      this.customerCode = params['customerCode'] ? params['customerCode'] : '';
      this.fromDate = params['fromDate'] ? params['fromDate'] : '';
      this.toDate = params['toDate'] ? params['toDate'] : '';
      this.paymentType = params['paymentType'] ? params['paymentType'] : '';
      this.tripType = params['tripType'] ? params['tripType'] : '';
      if (!this.fromDate || !this.toDate) {
        this.dateFilterAvailable = false;
        this.countFromDateAndToDate();
      } else {
        this.dateFilterAvailable = true;
      }
      this.getDashboardStats();
      this.customerStats();
    });

  }


  private getDashboardStats() {
    this.service
      .getApiStats(this.fromDate, this.toDate, this.customerCode.toString(), this.paymentType)
      .subscribe((res: any) => {
        if (res.status === 'OK') {
          this.dashboardStats = res.data;
        }
      });
  }

  private customerStats() {
    this.service
      .getCustomerStats(
        this.fromDate,
        this.toDate,
        this.customerCode.toString(),
        this.paymentType
      )
      .subscribe((res: any) => {
        if (res.status === 'OK') {
          this.transporterStatistics = res.data.totalUsers.find(
            user => user.roleName === 'ROLE_TRANSPORTER'
          );
          this.driverStatistics = res.data.totalUsers.find(
            user => user.roleName === 'ROLE_DRIVER'
          );
          this.customerStatistics = res.data.totalUsers.find(
            customer => customer.roleName === 'ROLE_CUSTOMER_ADMIN'
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
  protected readonly Math = Math;
}
