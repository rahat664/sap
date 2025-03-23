import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';

@Component({
  selector: 'app-new-trip',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    MatFormField,
    MatInput,
    MatButton,
    MatMenuTrigger,
    MatMenuModule,
    MatMenu,
    MatMenuItem,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
    GiveMaxHeightDirective,
  ],
  templateUrl: './new-trip.component.html',
  styleUrl: './new-trip.component.scss',
})
export class NewTripComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  companySuggestions: any;
  isCustomerMenuOpened: boolean;
  customerName: string;
  createButtonEnabled: boolean;
  templates: any[] = [];
  selectedTemplate: any;
  customerSelectMenuOpened = false;
  isTemplateEnabled: boolean;
  dontClearLocalStorage: boolean;
  totalPages: number;
  height: string;
  templateCustomer: any;
  favouriteCustomer: any;

  constructor(
    private customer: CustomerService,
    private service: TripService,
    private router: Router,
    private toastr: HandleToastrService
  ) {}

  ngOnInit(): void {

    this.getFavoriteCustomers();
    if (localStorage.getItem('isFromBackEdit')) {
      localStorage.removeItem('isFromBackEdit');
      this.dontClearLocalStorage = true;
    }
    if (localStorage.getItem('backFromTemplateEditOrUpdate')) {
      localStorage.removeItem('backFromTemplateEditOrUpdate');
      this.dontClearLocalStorage = true;
    } else {
      this.dontClearLocalStorage = false;
    }
    if (localStorage.getItem('tripData')) {
      localStorage.removeItem('tripData');
    }
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
        this.templateCustomer = res.data.content[0].name;
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
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
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
    localStorage.setItem('selectedCustomer', JSON.stringify(result));
    this.storeLatestFiveAsFavorite(result);
    this.getTripTemplate(result.customerCode);
    this.templateCustomer = result.name;
  }

  onCreateTrip() {
    this.customerSelectMenuOpened = false;
    this.isTemplateEnabled = false;
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('isFromTemplate');
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
    if (templatePoints[0].pointName && templatePoints[1].pointName) {
      return templatePoints[0].pointName + ' to ' + templatePoints[1].pointName;
    } else {
      return '';
    }
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

  changeStatus(template, edit: string) {
    if (edit === 'edit') {
      this.dontClearLocalStorage = true;
      localStorage.setItem('templateEdit', JSON.stringify(template));
      this.router.navigateByUrl('update-trip-template');
    } else {
      this.dontClearLocalStorage = true;
      this.dialog
        .open(ConfirmDeleteComponent, {
          width: '21.375rem',
          data: {
            title: 'Delete Template',
            text: `Are you sure you want to delete template ${template.name} ?`,
            buttonText: 'Delete',
            template: template,
          },
        })
        .afterClosed()
        .subscribe(res => {
          if (res === 'deleted') {
            this.service.deleteTemplate(template.id).subscribe(
              (res: any) => {
                if (res.status === 'OK') {
                  this.toastr.showSuccess('Template deleted successfully');
                  this.getTripTemplate(
                    JSON.parse(localStorage.getItem('selectedCustomer'))
                      .customerCode
                  );
                } else {
                  this.toastr.showError('Error deleting template');
                }
              },
              (error: any) => {
                this.toastr.showError('Error deleting template');
              }
            );
          }
        });
    }
  }

  onBottom($event: boolean) {}

  onClickClearCustomer() {
    this.createButtonEnabled = false;
    this.customerName = '';
    this.companySuggestions = [];
    this.isCustomerMenuOpened = false;
    localStorage.removeItem('selectedCustomer');
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('isFromTemplate');
    this.selectedTemplate = null;
    this.isTemplateEnabled = false;
    this.templates = [];
  }

  private storeLatestFiveAsFavorite(result: any) {
    const favoriteCustomers = JSON.parse(
      localStorage.getItem('favoriteCustomers')
    );
    if (favoriteCustomers) {
      if (favoriteCustomers.length < 5) {
        favoriteCustomers.push(result);
      } else {
        favoriteCustomers.shift();
        favoriteCustomers.push(result);
      }
      localStorage.setItem('favoriteCustomers', JSON.stringify(favoriteCustomers));
    } else {
      localStorage.setItem('favoriteCustomers', JSON.stringify([result]));
    }
  }

  private getFavoriteCustomers() {
    const favoriteCustomers = JSON.parse(
      localStorage.getItem('favoriteCustomers')
    );
    if (favoriteCustomers) {
      this.favouriteCustomer = favoriteCustomers;
    }
  }
}
