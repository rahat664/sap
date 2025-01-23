import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { TopCustomers } from '../../models/dashboard-stats.model';
import { DashboardService } from '../../services/dashboard.service';
import { RouterLink } from '@angular/router';
import { NumberSeperatorPipe } from '../../../../shared/pipes/number-seperator.pipe';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';

@Component({
  selector: 'app-top-customer',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NumberSeperatorPipe,
    MatFormField,
    MatSelect,
    MatOption,
    LoadingComponent,
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

  constructor(
    private datePipe: DatePipe,
    private service: DashboardService
  ) {}

  ngOnInit() {
    this.loading = false;
    this.getFromDateToDate();
    this.getTopCustomers();
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
      .getTopCustomers(this.fromDate, this.toDate, this.sortBy)
      .subscribe(
        (res: any) => {
          this.topCustomer = res.data.content;
          this.loading = false;
        },
        error => {
          console.error(error);
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
