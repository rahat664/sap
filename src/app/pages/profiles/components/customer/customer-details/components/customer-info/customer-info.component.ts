import { Component, Input } from '@angular/core';
import { Customer } from '../../../model/customer.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-customer-info',
  imports: [DatePipe],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.scss',
})
export class CustomerInfoComponent {
  @Input() customer!: Customer;
}
