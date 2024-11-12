import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-global-image-upload',
  standalone: true,
  imports: [
    DatePipe,
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatInput,
  ],
  templateUrl: './global-image-upload.component.html',
  styleUrl: './global-image-upload.component.scss',
})
export class GlobalImageUploadComponent {
  currentDate: Date = new Date();
  @Input() imageTypes: any[] = [
    { value: '1', viewValue: 'Image Type 1' },
    { value: '2', viewValue: 'Image Type 2' },
    { value: '3', viewValue: 'Image Type 3' },
  ];
  months: any[] = [
    { value: '1', viewValue: 'January' },
    { value: '2', viewValue: 'February' },
    { value: '3', viewValue: 'March' },
    { value: '4', viewValue: 'April' },
    { value: '5', viewValue: 'May' },
    { value: '6', viewValue: 'June' },
    { value: '7', viewValue: 'July' },
    { value: '8', viewValue: 'August' },
    { value: '9', viewValue: 'September' },
    { value: '10', viewValue: 'October' },
    { value: '11', viewValue: 'November' },
    { value: '12', viewValue: 'December' },
  ];

  onChangeImageType($event: any) {}
}
