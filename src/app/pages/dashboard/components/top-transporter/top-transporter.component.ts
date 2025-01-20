import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TopTransporters } from '../../models/dashboard-stats.model';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule, DatePipe } from '@angular/common';
import {RouterLink} from "@angular/router";
import {NumberSeperatorPipe} from "../../../../shared/pipes/number-seperator.pipe";

@Component({
  selector: 'app-top-transporter',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    NumberSeperatorPipe,
  ],
  templateUrl: './top-transporter.component.html',
  styleUrl: './top-transporter.component.scss',
})
export class TopTransporterComponent {
  topTransporter: TopTransporters[] = [];
  fromDate: string;
  toDate: string;

  constructor(
    private service: DashboardService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.getFromDateToDate();
    this.getTopTransporters();
  }

  private getTopTransporters() {
    this.service.getTopTransporters(this.fromDate, this.toDate).subscribe(
      (res: any) => {
        this.topTransporter = res.data.content;
      },
      error => {
        console.error(error);
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
