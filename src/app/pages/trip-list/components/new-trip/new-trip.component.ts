import { Component, OnInit } from '@angular/core';
import { CustomDatePickerComponent } from '../../../../shared/modules/custom-date-picker/custom-date-picker.component';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../profiles/services/customer.service';
import { GetOutsideModalClickDirective } from '../../../../shared/directive/get-outside-modal-click.directive';
import { TripService } from '../../services/trip.service';
import { CreateTripPageComponent } from '../create-trip-page/create-trip-page.component';

@Component({
  selector: 'app-new-trip',
  standalone: true,
  imports: [
    CustomDatePickerComponent,
    GMapComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    GetOutsideModalClickDirective,
    CreateTripPageComponent,
  ],
  templateUrl: './new-trip.component.html',
  styleUrl: './new-trip.component.scss',
})
export class NewTripComponent implements OnInit {
  companySuggestions: any;
  isCustomerMenuOpened: boolean;
  customerName: string;
  createButtonEnabled: boolean;
  templates: any;
  selectedTemplate: any;
  customerSelectMenuOpened: boolean = false;
  isTemplateEnabled: boolean;

  constructor(
    private customer: CustomerService,
    private service: TripService
  ) {}

  ngOnInit(): void {}

  onKeyUpCustomerSearch($event: KeyboardEvent) {
    this.companySuggestions = [];
    const target = $event.target as HTMLInputElement;
    if (target.value) {
      this.customer
        .searchCustomer(target.value, null)
        .subscribe((company: any) => {
          this.isCustomerMenuOpened = true;
          this.companySuggestions = company.data.content;
        });
    } else {
      this.isCustomerMenuOpened = false;
      this.companySuggestions = [];
    }
  }

  onClickCustomerSearchSuggestion(result: any) {
    this.createButtonEnabled = true;
    this.customerName = result.name;
    this.companySuggestions = [];
    this.isCustomerMenuOpened = false;
    this.getTripTemplate(result.customerCode);
  }

  onCreateTrip() {
    this.customerSelectMenuOpened = false;
    this.isTemplateEnabled = false;
    this.selectedTemplate = null;
  }

  getTripTemplate(userId) {
    this.service.getTripTemplate(userId).subscribe((res: any) => {
      this.templates = res.data;
    });
  }

  getTripRoute(templatePoints: any) {
    return templatePoints[0].point_name + ' to ' + templatePoints[1].point_name;
  }

  setTemplate(tripTemplate: any) {
    this.customerSelectMenuOpened = false;
    this.selectedTemplate = tripTemplate;
    this.isTemplateEnabled = true;
  }
}
