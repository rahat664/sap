import { Component, EventEmitter, Output } from '@angular/core';
import { CustomInputComponent } from '../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../shared/directive/get-click-event.directive';

import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { CustomInputSelectModel } from '../../../shared/modules/custom-input/custom-input-select.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { roles } from '../models/role-file';

@Component({
  selector: 'app-user-filter',
  imports: [
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    CustomInputComponent,
    GetClickEventDirective,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './user-filter.component.html',
  styleUrl: './user-filter.component.scss',
})
export class UserFilterComponent {
  @Output() filterClosed: EventEmitter<void> = new EventEmitter();
  @Output() filterApplied: EventEmitter<any> = new EventEmitter();
  @Output() filterData: EventEmitter<any> = new EventEmitter();
  buttonName: any[] = [
    'Today',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Custom',
  ];
  picker: any;
  event: any;
  selectedButton: any;
  startDate: string;
  endDate: string;
  customSelected: boolean;
  dateText: any;
  customDateText: any;
  tripTypeOptionsArray: CustomInputSelectModel[] = [
    {
      id: 0,
      value: '',
      selected: false,
      showname: 'All',
    },
    { id: 1, value: 'PROJECT', selected: false, showname: 'Project Logistics' },
    {
      id: 2,
      value: 'COMMERCIAL',
      selected: false,
      showname: 'Commercial Logistics',
    },
  ];
  customerName: any;
  customerCode: string;
  searchValue: string;
  companySuggestions: any[] = [];
  customerCodes: any[] = [];
  customers: any[] = [];
  customerNames: any[] = [];
  truckType: any;
  vehicleTypeList: any[] = [];
  transporterSuggestions: any[] = [];
  transporterName: string
  searchId: any;
  tripId: any;
  selectedTruckValues: any = [];
  truckRegistrationId: string;
  departmentFilter: string = '';
  statusOpened: boolean;
  roleOpened: boolean;
  statusValue: string = '';

  constructor(
  ) {
  }

  ngOnInit() {
    this.getDataFromLocalStorage();
  }

  onClose() {
    this.filterClosed.emit();
  }

  onApplyFilter() {
    // emit the filter data and store it to local storage
    const filterData = {
      status: this.statusValue || '',
      department: this.departmentFilter || '',
    };
    localStorage.setItem('tripFilterData', JSON.stringify(filterData));
    this.filterData.emit(filterData);
    this.filterApplied.emit(true);
    this.filterClosed.emit();
    this.updateOverLayStyle(false);
  }


  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }


  private getDataFromLocalStorage() {
    const tripFilterData = JSON.parse(localStorage.getItem('tripFilterData'));
    if (tripFilterData) {
      if (tripFilterData?.status) {
        this.statusValue = tripFilterData?.status;
        this.statusInputPlaceholder = tripFilterData?.status;
        this.updateSelectedOptions(this.statusOptionsArray, tripFilterData?.status);
      }
      if (tripFilterData?.department) {
        this.departmentFilter = tripFilterData?.department;
        this.roleInputPlaceholder = tripFilterData?.department;
      }
      localStorage.removeItem('tripFilterData');
    } else {
      this.statusInputPlaceholder = 'All';
      this.roleInputPlaceholder = '';
      this.statusValue = '';
      this.updateSelectedOptions(this.statusOptionsArray, 4);
    }
  }

  protected readonly roleOptionsArray = roles;
  roleInputPlaceholder: string = '';
  statusInputPlaceholder: string = 'Active';
  statusOptionsArray: CustomInputSelectModel[] = [
    { id: 1, value: 'Active', selected: true },
    { id: 2, value: 'Inactive', selected: false },
    { id: 3, value: 'Removed', selected: false },
    { id: 4, value: 'All', selected: false },
  ];

  onClickRole(isOpened: boolean): void {
    this.statusOpened = false;
    this.roleOpened = isOpened;
  }
  onSelectRole(id: number): void {
    this.roleInputPlaceholder =
      this.roleOptionsArray.find(item => item.id === id)?.value || '';
    this.departmentFilter = this.roleInputPlaceholder;
  }

  onClickStatus(isOpened: boolean): void {
    this.roleOpened = false;
    this.statusOpened = isOpened;
  }

  onSelectStatus(id: number): void {
    this.statusOpened = false;
    this.statusInputPlaceholder =
      this.statusOptionsArray.find(item => item.id === id)?.value || '';
    this.statusValue = id === 4 ? '' : this.statusInputPlaceholder;
    this.updateSelectedOptions(this.statusOptionsArray, id);
  }

  private updateSelectedOptions(
    array: CustomInputSelectModel[],
    selectedId: number
  ): void {
    array.forEach(item => (item.selected = item.id === selectedId));
  }
}
