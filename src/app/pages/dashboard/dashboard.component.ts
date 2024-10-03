import { Component } from '@angular/core';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { StatusHeighlightComponent } from './components/status-heighlight/status-heighlight.component';
import { MonthWiseRevenueComponent } from './components/month-wise-revenue/month-wise-revenue.component';
import { LiveTripStatusComponent } from './components/live-trip-status/live-trip-status.component';
import { ChallanStatusComponent } from './components/challan-status/challan-status.component';
import { TopTransporterComponent } from './components/top-transporter/top-transporter.component';
import { TopCustomerComponent } from './components/top-customer/top-customer.component';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    GetElementHeightDirective,
    StatusHeighlightComponent,
    MonthWiseRevenueComponent,
    LiveTripStatusComponent,
    ChallanStatusComponent,
    TopTransporterComponent,
    TopCustomerComponent,
    GiveMaxHeightDirective,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  height: any;

  ngOnInit() {}
}
