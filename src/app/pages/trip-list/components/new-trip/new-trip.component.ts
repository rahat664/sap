import { Component } from '@angular/core';
import { CustomDatePickerComponent } from '../../../../shared/modules/custom-date-picker/custom-date-picker.component';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-trip',
  standalone: true,
  imports: [
    CustomDatePickerComponent,
    GMapComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-trip.component.html',
  styleUrl: './new-trip.component.scss',
})
export class NewTripComponent {
  tripCreateForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.tripCreateForm = this.fb.group({
      companyName: ['', [Validators.required]],
    });
  }
}
