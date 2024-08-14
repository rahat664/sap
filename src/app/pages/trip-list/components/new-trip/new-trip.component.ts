import { Component, OnInit } from '@angular/core';
import { CustomDatePickerComponent } from '../../../../shared/modules/custom-date-picker/custom-date-picker.component';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../profiles/services/customer.service';
import { GetOutsideModalClickDirective } from '../../../../shared/directive/get-outside-modal-click.directive';
import { TripService } from '../../services/trip.service';
import { CreateTripPageComponent } from '../create-trip-page/create-trip-page.component';
import { Router, RouterLink } from '@angular/router';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import {
  MatMenu,
  MatMenuItem,
  MatMenuModule,
  MatMenuTrigger,
} from '@angular/material/menu';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';

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
    RouterLink,
    MatFormField,
    MatInput,
    MatCard,
    MatButton,
    MatMenuTrigger,
    MatMenuModule,
    MatMenu,
    MatMenuItem,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
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
  dontClearLocalStorage: boolean;

  constructor(
    private customer: CustomerService,
    private service: TripService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.manageStore();
    if (this.isAdmin()) {
      const selectedCustomer = localStorage.getItem('selectedCustomer');
      if (selectedCustomer) {
        this.customerName = JSON.parse(selectedCustomer).name;
        this.getTripTemplate(JSON.parse(selectedCustomer).customerCode);
        this.createButtonEnabled = true;
      } else {
        this.createButtonEnabled = false;
      }
    } else {
      this.customer.getCustomer(0, 20).subscribe((res: any) => {
        this.customerName = res.data.content[0].name;
        this.getTripTemplate(res.data.content[0].customerCode);
        localStorage.setItem(
          'selectedCustomer',
          JSON.stringify(res.data.content[0])
        );
        this.createButtonEnabled = true;
      });
    }
  }

  isAdmin() {
    return (
      localStorage.getItem('role') === 'ROLE_ADMIN' ||
      localStorage.getItem('role') === 'ROLE_KAM'
    );
  }

  onKeyUpCustomerSearch($event: KeyboardEvent) {
    this.companySuggestions = [];
    const target = $event.target as HTMLInputElement;
    if (target.value) {
      this.customer
        .searchCustomer(0, 1000, target.value, null)
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
    localStorage.setItem('selectedCustomer', JSON.stringify(result));
  }

  onCreateTrip() {
    this.customerSelectMenuOpened = false;
    this.isTemplateEnabled = false;
    this.selectedTemplate = null;
    this.router.navigate(['/trip-create/create']);
    this.dontClearLocalStorage = true;
  }

  getTripTemplate(userId) {
    this.service.getTripTemplate(userId).subscribe((res: any) => {
      this.templates = res.data;
    });
  }

  getTripRoute(templatePoints: any) {
    return templatePoints[0].pointName + ' to ' + templatePoints[1].pointName;
  }

  setTemplate(tripTemplate: any) {
    this.customerSelectMenuOpened = false;
    this.selectedTemplate = tripTemplate;
    this.isTemplateEnabled = true;
    localStorage.setItem('selectedTemplate', JSON.stringify(tripTemplate));
    localStorage.setItem('isFromTemplate', 'true');
    this.router.navigate(['/trip-create/create']);
    this.dontClearLocalStorage = true;
  }

  private manageStore() {
    const cachedTruckSize = [
      {
        value: 5,
        selected: false,
      },
      {
        value: 10,
        selected: false,
      },
      {
        value: 12,
        selected: false,
      },
      {
        value: 12.5,
        selected: false,
      },
      {
        value: 13,
        selected: false,
      },
    ];
    const cachedTruckCapacity = [
      {
        value: 5,
        selected: false,
      },
      {
        value: 10,
        selected: false,
      },
      {
        value: 12,
        selected: false,
      },
      {
        value: 12.5,
        selected: false,
      },
      {
        value: 13,
        selected: false,
      },
    ];
    const cachedNoOfTrucks = [
      {
        value: 1,
        selected: false,
      },
      {
        value: 2,
        selected: false,
      },
      {
        value: 5,
        selected: false,
      },
      {
        value: 10,
        selected: false,
      },
      {
        value: 50,
        selected: false,
      },
    ];
    if (localStorage.getItem('noOfTrucks')) {
      return;
    } else {
      localStorage.setItem('noOfTrucks', JSON.stringify(cachedNoOfTrucks));
    }
    if (localStorage.getItem('truckSize')) {
      return;
    } else {
      localStorage.setItem('truckSize', JSON.stringify(cachedTruckSize));
    }
    if (localStorage.getItem('truckCapacity')) {
      return;
    } else {
      localStorage.setItem(
        'truckCapacity',
        JSON.stringify(cachedTruckCapacity)
      );
    }
  }

  ngOnDestroy(): void {
    if (!this.dontClearLocalStorage) {
      localStorage.removeItem('selectedCustomer');
      localStorage.removeItem('selectedTemplate');
      localStorage.removeItem('isFromTemplate');
    }
  }

  onClickAddTemplate() {
    this.dontClearLocalStorage = true;
  }
}
