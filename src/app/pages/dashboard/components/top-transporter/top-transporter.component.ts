import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { TopTransporters } from '../../models/dashboard-stats.model';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';

@Component({
  selector: 'app-top-transporter',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    numberPipe,
    MatFormField,
    MatSelect,
    MatOption,
    LoadingComponent,
  ],
  templateUrl: './top-transporter.component.html',
  styleUrl: './top-transporter.component.scss',
})
export class TopTransporterComponent implements OnInit {
  topTransporter: TopTransporters[] = [];
  fromDate: string;
  toDate: string;
  sortBy = 'grossProfit';
  loading: boolean;
  customerCode: string;
  paymentType: string = '';
  tripType: string = '';

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loading = false;
    this.activatedRoute.queryParams.subscribe(params => {
      this.customerCode = params['customerCode'] ? params['customerCode'] : '';
      this.paymentType = params['paymentType'] ? params['paymentType'] : '';
      this.tripType = params['tripType'] ? params['tripType'] : '';
      if (params['fromDate'] && params['toDate']) {
        this.fromDate = params['fromDate'];
        this.toDate = params['toDate'];
      } else {
        this.getFromDateToDate();
      }
      this.getTopTransporters();
    } )
  }

  private getTopTransporters() {
    this.service
      .getTopTransporters(this.fromDate, this.toDate, this.sortBy, this.customerCode, this.paymentType)
      .subscribe(
        (res: any) => {
          this.topTransporter = res.data.content;
          this.loading = false;
        },
        error => {
          this.loading = false;
        }
      );
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

  getBackgroundColor(alphabet: string) {
   if (alphabet) {
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
   } else {
      return 'bg-another';
   }
  }

  changeSorting($event: MatSelectChange) {
    this.loading = true;
    this.topTransporter = [];
    this.getTopTransporters();
  }
}
