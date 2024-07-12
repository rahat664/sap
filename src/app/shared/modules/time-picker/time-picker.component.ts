import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
})
export class TimePickerComponent {
  hour: number = 10;
  minute: number = 30;
  period: string = 'AM';

  constructor() {}

  increaseHour() {
    this.hour = (this.hour % 12) + 1;
  }

  decreaseHour() {
    this.hour = this.hour - 1 || 12;
  }

  increaseMinute() {
    this.minute = (this.minute + 1) % 60;
  }

  decreaseMinute() {
    this.minute = (this.minute - 1 + 60) % 60;
  }

  togglePeriod() {
    this.period = this.period === 'AM' ? 'PM' : 'AM';
  }
}
