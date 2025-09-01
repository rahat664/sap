import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDateRangeInput, MatDateRangePicker, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-manage-trip-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormField,
    MatFormFieldModule,
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatDatepickerModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatInput,
    MatOption,
    MatSelect,
  ],
  templateUrl: './manage-trip-filters.component.html',
  styleUrls: ['./manage-trip-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageTripFiltersComponent {
  @Input() filterLength = 0;
  @Input() buttonName: string[] = [];
  @Input() selectedButton: string = '';
  @Input() dateText: string = '';
  @Input() customDateText: string = '';
  @Input() customSelected = false;
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() vehicleTypeList: any[] = [];
  @Input() truckType: any[] = [];
  @Input() paymentTypeOptionsArray: any[] = [];
  @Input() paymentTypeValue: any[] = [];
  @Input() tripTypeOptionsArray: any[] = [];
  @Input() tripTypeValue: any[] = [];
  @Input() loading = false;
  // Customer/Transporter search
  @Input() showCustomer = false;
  @Input() showTransporter = false;
  @Input() customerName: string = '';
  @Input() customers: any[] = [];
  @Input() companySuggestions: any[] = [];
  @Input() transporterName: string = '';
  @Input() transporters: any[] = [];
  @Input() transporterSuggestions: any[] = [];

  @Output() clearAll = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() filterButtonClick = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() truckTypeChange = new EventEmitter<any>();
  @Output() tripTypeChange = new EventEmitter<any>();
  @Output() paymentTypeChange = new EventEmitter<any>();
  @Output() apply = new EventEmitter<void>();
  // Customer/Transporter events
  @Output() customerQueryChange = new EventEmitter<KeyboardEvent>();
  @Output() customerSuggestionSelect = new EventEmitter<any>();
  @Output() customerRemove = new EventEmitter<any>();
  @Output() transporterQueryChange = new EventEmitter<KeyboardEvent>();
  @Output() transporterSuggestionSelect = new EventEmitter<any>();
  @Output() transporterRemove = new EventEmitter<any>();

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }
}
