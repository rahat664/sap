import { Component, EventEmitter, Output } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { CustomInputComponent } from '../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../shared/modules/custom-input/custom-input-select.model';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { districts } from '../../../shared/models/ditrict-with-latlng.model';

@Component({
  selector: 'app-payment-filter',
  imports: [
    FormsModule,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatFormFieldModule,
    MatDateRangeInput,
    MatFormField,
    NgIf,
    NgForOf,
    CustomInputComponent,
    GetClickEventDirective,
    MatAutocomplete,
    MatInput,
    MatAutocompleteTrigger,
    MatOption,
    MatSelect,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './payment-filter.component.html',
  styleUrl: './payment-filter.component.scss',
})
export class PaymentFilterComponent {
  @Output() filterClosed: EventEmitter<void> = new EventEmitter<void>();
  buttonName: any[] = [
    'Today',
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Custom',
  ];
  selectedButton: any;
  startDate: string;
  endDate: string;
  customSelected: boolean;
  dateSelected: boolean;
  dateText: any;
  customDateText: any;
  previousFilterLength: number;
  filterLength: number;
  paymentStatusPlaceholder: string;
  paymentStatusOptionsArray: CustomInputSelectModel[] = [
    {
      id: 1,
      value: '',
      selected: true,
      showname: 'All',
    },
    {
      id: 2,
      value: 'paid',
      selected: false,
      showname: 'Paid',
    },
    {
      id: 3,
      value: 'Partially Paid',
      selected: false,
      showname: 'Partially Paid',
    },
    {
      id: 4,
      value: 'unpaid',
      selected: false,
      showname: 'Unpaid',
    },
  ];
  searchId: any;
  tripIdSuggestions: any[] = [];
  tripId: any;
  tripStatusPlaceholder: string;
  tripStatusOptionsArray: CustomInputSelectModel[] = [
    {
      id: 1,
      value: '',
      selected: true,
      showname: 'All',
    },
    {
      id: 2,
      value: 'booked',
      selected: false,
      showname: 'Booked',
    },
    {
      id: 3,
      value: 'completed',
      selected: false,
      showname: 'Completed',
    },
    {
      id: 4,
      value: 'running',
      selected: false,
      showname: 'Running',
    },
  ];
  searchName: any;
  tripSuggestions: any;
  searchValue: any;

  constructor(private datePipe: DatePipe) {}

  onApplyFilter() {}

  onClose() {
    this.filterClosed.emit();
  }

  onClickFilterButton(event: any, picker: any) {
    this.selectedButton = event;
    if (event === 'Custom') {
      this.startDate = '';
      this.endDate = '';
      this.customSelected = true;
      this.dateSelected = false;
      picker.open();
    } else {
      this.customSelected = false;
      this.dateText = event;
      picker.close();
      if (event === 'Today') {
        this.startDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.dateText = event;
      } else if (event === 'Last 7 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 7)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      } else if (event === 'Last 15 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 15)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      } else if (event === 'Last 30 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 30)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      }
    }
  }

  onChangeStartDate($event: Event) {
    this.startDate = ($event.target as HTMLInputElement).value;
    this.startDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
  }

  onChangeEndDate($event: any) {
    if ($event.target.value) {
      this.endDate = ($event.target as HTMLInputElement).value;
      this.endDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
      this.customDateText = `${this.startDate} - ${this.endDate}`;
      if (!this.dateSelected) {
        this.previousFilterLength += 1;
        this.filterLength += 1;
      }
      this.dateSelected = true;
    } else {
      this.endDate = '';
      if (this.dateSelected && this.filterLength > 1) {
        this.filterLength -= 1;
        this.previousFilterLength -= 1;
      }
    }
  }

  onSelectPayment($event: number) {
    this.paymentStatusOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.paymentStatusPlaceholder =
      this.paymentStatusOptionsArray.find(x => x.id === $event)?.showname || '';
  }

  onKeyUpTripSearch($event: KeyboardEvent) {

  }

  onClickTripSearchSuggestion(option: any) {

  }

  onClickClearTripId() {

  }

  onSelectTripStatus($event: number) {
    this.tripStatusOptionsArray.forEach(x => (x.selected = x.id === $event));
    this.tripStatusPlaceholder =
      this.tripStatusOptionsArray.find(x => x.id === $event)?.showname || '';
  }

  onSearchInputChange($event: KeyboardEvent) {

  }

  onClickSearchSuggestion(option: any) {

  }

  onClickClearCompany() {

  }

  protected readonly districts = [];
  loadingDistrict: any;
  unloadingDistrict: any;

  onLoadingDistrictChange($event: MatSelectChange) {

  }

  onUnloadingDistrictChange($event: MatSelectChange) {

  }
}
