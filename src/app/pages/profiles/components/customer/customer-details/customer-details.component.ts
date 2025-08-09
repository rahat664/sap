import { Component } from '@angular/core';
import { Customer } from '../model/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { CustomerInfoComponent } from './components/customer-info/customer-info.component';
import { CustomerStatsComponent } from './components/customer-stats/customer-stats.component';
import { ContactPersonComponent } from './components/contact-person/contact-person.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-customer-details',
  imports: [
    CustomerInfoComponent,
    CustomerStatsComponent,
    ContactPersonComponent,
    NgIf,
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent {
  customer: Customer | null = null;
  loading = true;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomerDetails();
  }

  private loadCustomerDetails() {
    const customerCode = localStorage.getItem('selectedCustomerCode');
    this.customerService.getCustomerDetails(customerCode).subscribe({
      next: (response: any) => {
        this.customer = response.data as Customer;
        this.loading = false;
      },
      error: error => {
        console.error('Error fetching customer details:', error);
        this.loading = false;
      },
    });
  }
}
