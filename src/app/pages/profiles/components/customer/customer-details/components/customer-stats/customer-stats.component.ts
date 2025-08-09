import { Component, Input } from '@angular/core';
import { Customer } from '../../../model/customer.model';

@Component({
  selector: 'app-customer-stats',
  imports: [],
  templateUrl: './customer-stats.component.html',
  styleUrl: './customer-stats.component.scss'
})
export class CustomerStatsComponent {
  @Input() customer!: Customer;
}
