import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { TopCustomers } from '../../models/dashboard-stats.model';
import { DashboardService } from '../../services/dashboard.service';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-top-customer',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    DecimalPipe,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './top-customer.component.html',
  styleUrl: './top-customer.component.scss',
})
export class TopCustomerComponent {
  topCustomer: TopCustomers[] = [];
  fromDate: string;
  toDate: string;

  constructor(
    private datePipe: DatePipe,
    private service: DashboardService
  ) {}

  ngOnInit() {
    this.getFromDateToDate();
    this.getTopCustomers();
  }

  private getFromDateToDate() {
    // from date will be 1 january 2024
    // end date will be current date
    const d = new Date();
    const currentYear = d.getFullYear();
    this.fromDate = '2024-01-01';
    // last day of the current month
    this.toDate = this.datePipe.transform(
      new Date(currentYear, d.getMonth() + 1, 0),
      'yyyy-MM-dd'
    );
  }

  private getTopCustomers() {
    this.service.getTopCustomers(this.fromDate, this.toDate).subscribe(
      (res: any) => {
        this.topCustomer = res.data.content;
      },
      error => {
        console.error(error);
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
}
