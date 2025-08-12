import { Component, inject } from '@angular/core';
import { ContactPerson, Customer } from '../model/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { CustomerInfoComponent } from './components/customer-info/customer-info.component';
import { CustomerStatsComponent } from './components/customer-stats/customer-stats.component';
import { ContactPersonComponent } from './components/contact-person/contact-person.component';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CustomerUpdateComponent } from '../customer-update/customer-update.component';

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
  readonly dialog = inject(MatDialog);
  customer: Customer | null = null;
  loading = true;
  contactPersonObject: ContactPerson;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomerDetails();
  }

  private loadCustomerDetails() {
    const customerCode = localStorage.getItem('selectedCustomerCode');
    this.customerService.getCustomerDetails(customerCode).subscribe({
      next: (response: any) => {
        this.customer = response.data as Customer;
        localStorage.setItem('customerData', JSON.stringify(this.customer));
        this.loading = false;
        this.contactPersonObject = {
          contactPersonName: this.customer.contactPerson,
          phone: this.customer.phone,
          email: this.customer.email,
        }
        localStorage.setItem('contactPersonData', JSON.stringify(this.contactPersonObject));
        localStorage.setItem('selectedCustomerId', String(this.customer.id));
      },
      error: error => {
        console.error('Error fetching customer details:', error);
        this.loading = false;
      },
    });
  }

  onEdit() {
    this.dialog.open(
      CustomerUpdateComponent, {
        minWidth: '50vw',
        maxHeight: '90vh',
      }
    ).afterClosed().subscribe((result) => {
      if (result) {
        this.loadCustomerDetails();
      }
    })
  }
}
