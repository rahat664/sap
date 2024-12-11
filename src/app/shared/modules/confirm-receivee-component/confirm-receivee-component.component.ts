import { Component, Inject } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCalendar, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatCard } from '@angular/material/card';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-confirm-receivee-component',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatCalendar,
    MatCard,
    MatMenu,
    MatTooltip,
    TimePickerComponent,
    MatButton,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    MatSuffix,
    MatMenuTrigger,
    FormsModule,
    DatePipe,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './confirm-receivee-component.component.html',
  styleUrl: './confirm-receivee-component.component.scss',
})
export class ConfirmReceiveeComponentComponent {
  selectedDate: Date = new Date();
  returnToInputDate: Date = new Date();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<ConfirmReceiveeComponentComponent>
  ) {}
  closeDialog() {
    this.dialogRef.close(false);
  }

  confirmReceive() {
    this.dialogRef.close(this.selectedDate);
  }

  onSelectTimeAndDate() {
    // convert time to 24-hour format
    const time = this.time.split(' ')[0];
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);
    const amOrPm = this.time.split(' ')[1];
    const timeIn24HourFormat = amOrPm === 'PM' ? hour + 12 : hour;
    const selectedDate = this.selectedDate;
    selectedDate.setHours(timeIn24HourFormat, hour);
    selectedDate.setMinutes(minute);
  }

  onSelect($event: any) {
    this.selectedDate = $event;
    this.returnToInputDate = $event;
  }
  private time: any;
  onTimeChange($event: any) {
    this.time = $event;
  }

  getSelectedDate() {
    return this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd h:mm a');
  }
}
