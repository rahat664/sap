import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusCardComponent } from './status-card/status-card.component';
import {
  customerStats,
  DashboardStatsModel,
  userStats,
} from '../../models/dashboard-stats.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';
import {combineLatest, Subject, takeUntil} from "rxjs";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-status-heighlight',
  imports: [
    ReactiveFormsModule,
    StatusCardComponent,
    RouterLink,
    numberPipe,
    NgIf,
  ],
  templateUrl: './status-heighlight.component.html',
  styleUrl: './status-heighlight.component.scss',
})
export class StatusHeighlightComponent implements OnInit {
  private destroy$ = new Subject<void>();
  fromDate: string;
  toDate: string;
  dashboardStats: DashboardStatsModel;
  customerStatistics: customerStats;
  transporterStatistics: userStats;
  driverStatistics: userStats;
  customerCode: any[] = [];
  truckTypeId = [];
  dateFilterAvailable: boolean;
  paymentType: string = '';
  tripType: string = '';
  transporterName: string = '';

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([data, params]: [any, any]) => {
        const dashboardData = data.dashboardData.data;
        this.dashboardStats = dashboardData?.apiStats?.data;
        this.customerStatistics =
          dashboardData?.customerStats?.data?.totalUsers.find(
            (customer: customerStats) => customer.roleName === 'ROLE_CUSTOMER'
          );
        this.transporterStatistics =
          dashboardData?.customerStats?.data?.totalUsers.find(
            (user: userStats) => user.roleName === 'ROLE_TRANSPORTER'
          );
        this.driverStatistics =
          dashboardData?.customerStats?.data?.totalUsers.find(
            (user: userStats) => user.roleName === 'ROLE_DRIVER'
          );
        this.fromDate = params['fromDate'];
        this.toDate = params['toDate'];
        this.transporterName = params['transporterName'];
        this.dateFilterAvailable = !!(this.fromDate && this.toDate);
      });
  }

  customerIsNotEnterprise() {
    return localStorage.getItem('enterpriseCode') !== 'E-3';
  }

  protected readonly localStorage = localStorage;
  protected readonly Math = Math;
}
