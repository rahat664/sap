import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { TimePickerComponent } from '../time-picker/time-picker.component';

@Component({
  selector: 'app-date-time-picker-dialog',
  templateUrl: './date-time-picker-dialog.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerInput,
    TimePickerComponent,
  ],
  styleUrl: './date-time-picker-dialog.component.scss',
})
export class DateTimePickerDialogComponent {
  selectedDate: Date | null = null;
  selectedDateTime: string = '';

  constructor(public dialog: MatDialog) {}

  openTimePicker() {
    const dialogRef = this.dialog.open(TimePickerComponent, {
      width: '250px',
      data: { date: this.selectedDate },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { hour, minute, period } = result;
        const time = `${hour}:${minute < 10 ? '0' + minute : minute} ${period}`;
        this.selectedDateTime = `${this.selectedDate?.toLocaleDateString()} ${time}`;
      }
    });
  }
}
