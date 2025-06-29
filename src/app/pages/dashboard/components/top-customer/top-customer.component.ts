import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { TopCustomers } from '../../models/dashboard-stats.model';
import { DashboardService } from '../../services/dashboard.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';

@Component({
  selector: 'app-top-customer',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    numberPipe,
    MatFormField,
    MatSelect,
    MatOption,
    LoadingComponent,
    RouterLink,
  ],
  templateUrl: './top-customer.component.html',
  styleUrl: './top-customer.component.scss',
})
export class TopCustomerComponent implements OnInit {
  topCustomer: TopCustomers[] = [];
  fromDate: string;
  toDate: string;
  sortBy: string = 'grossProfit';
  loading: boolean;
  customerFilterEnabled: boolean = false;
  paymentType: string = '';
  tripType: string = '';
  truckTypeId: any;

  constructor(
    private datePipe: DatePipe,
    private service: DashboardService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loading = false;
    this.activatedRoute.queryParams.subscribe(params => {
      this.paymentType = params['paymentType'] ? params['paymentType'] : '';
      this.tripType = params['tripType'] ? params['tripType'] : '';
      this.truckTypeId = params['truckTypeId'] ? params['truckTypeId'] : '';
      this.customerFilterEnabled = !!params['customerCode'];
      if (params['fromDate'] && params['toDate']) {
        this.fromDate = params['fromDate'];
        this.toDate = params['toDate'];
      } else {
        this.getFromDateToDate();
      }
      this.getTopCustomers();
    });
  }

  private getFromDateToDate() {
    // from date will be 1 january 2024
    // end date will be current date
    const d = new Date();
    const currentYear = d.getFullYear();
    this.fromDate = '2024-01-01';
    // current day of current month
    this.toDate = this.datePipe.transform(d, 'yyyy-MM-dd');
  }

  private getTopCustomers() {
    this.service
      .getTopCustomers(this.fromDate, this.toDate, this.sortBy, this.paymentType,this.tripType, this.truckTypeId.toString())
      .subscribe(
        (res: any) => {
          this.topCustomer = res.data.content;
          this.loading = false;
        },
        error => {
          this.loading = false;
        }
      );
  }

  getBackgroundColor(alphabet: string) {
    if ('agmsy'.includes(alphabet)) {
      return 'bg-agmsy';
    } else if ('bhntz'.includes(alphabet)) {
      return 'bg-bhntz';
    } else if ('ciou'.includes(alphabet)) {
      return 'bg-ciou';
    } else if ('djpv'.includes(alphabet)) {
      return 'bg-djpv';
    } else if ('ekqw'.includes(alphabet)) {
      return 'bg-ekqw';
    } else if ('flrx'.includes(alphabet)) {
      return 'bg-flrx';
    } else {
      return 'bg-another';
    }
  }

  sortData() {
    this.topCustomer = [];
    this.loading = true;
    this.getTopCustomers();
  }
}
