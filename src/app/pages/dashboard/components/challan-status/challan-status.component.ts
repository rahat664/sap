import { Component, OnInit } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusCardComponent } from '../status-heighlight/status-card/status-card.component';
import { PieChartComponent } from '../../../../shared/charts/pie-chart/pie-chart.component';
import { DashboardService } from '../../services/dashboard.service';
import { challanStatus } from '../../models/dashboard-stats.model';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-challan-status',
  imports: [ReactiveFormsModule, PieChartComponent, RouterLink],
  templateUrl: './challan-status.component.html',
  styleUrl: './challan-status.component.scss',
})
export class ChallanStatusComponent implements OnInit {
  challanStatus: challanStatus;
  fromDate: string;
  toDate: string;
  customerCode: any;
   paymentType: string = '';
   tripType: string = '';

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.customerCode = params['customerCode'] ? params['customerCode'] : '';
      this.paymentType = params['paymentType'] ? params['paymentType'] : '';
      this.tripType = params['tripType'] ? params['tripType'] : '';
      this.fromDate = params['fromDate'] ? params['fromDate'] : '';
      this.toDate = params['toDate'] ? params['toDate'] : '';
      if (!this.fromDate || !this.toDate) {
        this.getFromDateAndToDate();
      }

      this.getChallanStatus();
    });
  }

  private getFromDateAndToDate() {
    // fromdate will be the first day of the current month
    // fromDate will be 1st january 2024
    const fromDate = new Date();
    fromDate.setFullYear(2024);
    fromDate.setMonth(0);
    fromDate.setDate(1);
    this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd');
    // todate should be the current date
    const toDate = new Date();
    // to date will be the last day of the current month
    this.toDate = this.datePipe.transform(
      new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0),
      'yyyy-MM-dd'
    );
  }

  private getChallanStatus() {
    this.service
      .getChallanStatus(this.fromDate, this.toDate, this.customerCode.toString(), this.paymentType, this.tripType)
      .subscribe((res: any) => {
        this.challanStatus = res.data;
      });
  }
}
