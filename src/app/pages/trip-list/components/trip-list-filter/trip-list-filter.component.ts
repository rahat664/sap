import { Component, EventEmitter, Output } from '@angular/core';
import { CustomInputComponent } from '../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../shared/directive/get-click-event.directive';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { MatFormField, MatInput, MatSuffix } from '@angular/material/input';
import { NgForOf, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-list-filter',
  imports: [

  ],
  templateUrl: './trip-list-filter.component.html',
  styleUrl: './trip-list-filter.component.scss',
})
export class TripListFilterComponent {
  @Output() filterClosed: EventEmitter<void> = new EventEmitter();

  onClose() {

  }
}
