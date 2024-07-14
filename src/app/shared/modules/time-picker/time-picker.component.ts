import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [MatFormField, MatInput, FormsModule, NgClass],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
})
export class TimePickerComponent {
  inputTime: string;
  currentHour = new Date().getHours();
  currentHourShow =
    this.currentHour > 12
      ? (this.currentHour - 12).toString()
      : this.currentHour.toString();
  currentMinute = new Date().getMinutes().toString();
  @Output() timeChange: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.currentHourShow =
      this.currentHourShow.length === 1
        ? (this.currentHourShow = '0' + this.currentHourShow)
        : this.currentHourShow;
    this.currentMinute =
      this.currentMinute.toString().length === 1
        ? '0' + this.currentMinute
        : this.currentMinute;
    this.inputTime =
      this.currentHourShow +
      ':' +
      this.currentMinute +
      ' ' +
      this.getTimeStateAmOrPm();
    this.timeChange.emit(this.inputTime);
  }

  getTimeStateAmOrPm() {
    return this.currentHour >= 12 ? 'PM' : 'AM';
  }

  onKeyPressHour($event: KeyboardEvent) {
    // take number only
    if ($event.key.match(/[^0-9]/)) {
      $event.preventDefault();
    }
    // take only 2 digit
    if ($event.target['value'].length >= 2) {
      $event.preventDefault();
    }

    // take minimum 1 and maximum 12
    if (parseInt($event.target['value'] + $event.key) > 12) {
      $event.preventDefault();
    }
  }

  onkeyPressMinute($event: KeyboardEvent) {
    // take number only
    if ($event.key.match(/[^0-9]/)) {
      $event.preventDefault();
    }
    // take only 2 digit
    if ($event.target['value'].length >= 2) {
      $event.preventDefault();
    }

    // take minimum 0 and maximum 59
    if (parseInt($event.target['value'] + $event.key) > 59) {
      $event.preventDefault();
    }
  }

  toggleTimeState() {
    this.currentHour =
      this.currentHour >= 12 ? this.currentHour - 12 : this.currentHour + 12;
  }

  onHourChange($event: Event) {
    this.inputTime =
      this.currentHourShow +
      ':' +
      this.currentMinute +
      ' ' +
      this.getTimeStateAmOrPm();
    this.timeChange.emit(this.inputTime);
  }

  onMinuteChange($event: Event) {
    this.inputTime =
      this.currentHourShow +
      ':' +
      this.currentMinute +
      ' ' +
      this.getTimeStateAmOrPm();
    this.timeChange.emit(this.inputTime);
  }
}
