import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [MatFormField, MatInput, FormsModule, NgClass, MatTooltip],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
})
export class TimePickerComponent {
  inputTime: string;
  currentDate = new Date();
  currentHour = new Date().getHours();
  @Input() selectedDate: Date = new Date();
  currentHourShow: string;

  currentMinuteCheck = new Date().getMinutes();
  currentMinute = new Date().getMinutes().toString();
  @Output() timeChange: EventEmitter<any> = new EventEmitter();
  currentHourError: boolean;
  @Output() buttonDisabled: EventEmitter<boolean> = new EventEmitter(false);
  currentMinuteError: any;
  @Input() fromModal: boolean = false;

  ngOnInit() {
    this.currentHourShow = this.currentHourShowWithSixHourPlus();

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

    // Handle backspace to clear the input
    if ($event.key === 'Backspace') {
      return; // Allow backspace to clear the input
    }

    const currentValue = $event.target['value'];
    const newValue =
      currentValue.slice(0, $event.target['selectionStart']) +
      $event.key +
      currentValue.slice($event.target['selectionEnd']);

    // Allow only digits 0-9
    if (!/^\d$/.test($event.key)) {
      $event.preventDefault();
      return;
    }

    // Prevent leading '0' if the current value is '0'
    if (currentValue === '0' && $event.key === '0') {
      $event.preventDefault();
      return;
    }

    // Check if the resulting value is a valid minute (0-59)
    const inputValue = parseInt(newValue, 10);
    if (isNaN(inputValue) || inputValue < 0 || inputValue > 12) {
      $event.preventDefault();
      return;
    }

    // Restrict input to a maximum of 2 digits
    if (newValue.length > 2) {
      $event.preventDefault();
      return;
    }
    if (
      this.currentDate.getDate() === this.selectedDate.getDate() &&
      this.getTimeStateAmOrPm() === 'PM'
    ) {
      const currentHourIn12 =
        this.currentHour > 12 ? this.currentHour - 12 : this.currentHour;
      const currentHourInTwoDigit =
        currentHourIn12.toString().length === 1
          ? '0' + currentHourIn12.toString()
          : currentHourIn12.toString();
      if (newValue.length === 1) {
        if (parseInt(newValue) < parseInt(currentHourInTwoDigit[0])) {
          $event.preventDefault();
        }
      } else {
        if (parseInt(newValue) < parseInt(currentHourInTwoDigit)) {
          $event.preventDefault();
        }
      }
    }
  }

  onkeyPressMinute($event: KeyboardEvent) {
    // Handle backspace to clear the input

    if ($event.key === 'Backspace') {
      return; // Allow backspace to clear the input
    }

    const currentValue = $event.target['value'];
    const newValue =
      currentValue.slice(0, $event.target['selectionStart']) +
      $event.key +
      currentValue.slice($event.target['selectionEnd']);

    // Allow only digits 0-9
    if (!/^\d$/.test($event.key)) {
      $event.preventDefault();
      return;
    }

    // Prevent leading '0' if the current value is '0'
    if (currentValue === '0' && $event.key === '0') {
      $event.preventDefault();
      return;
    }

    // Check if the resulting value is a valid minute (0-59)
    const inputValue = parseInt(newValue, 10);
    if (isNaN(inputValue) || inputValue < 0 || inputValue > 59) {
      $event.preventDefault();
      return;
    }

    // Restrict input to a maximum of 2 digits
    if (newValue.length > 2) {
      $event.preventDefault();
      return;
    }
    const currentHourIn12 =
      this.currentHour > 12 ? this.currentHour - 12 : this.currentHour;
    if (
      currentHourIn12 === parseInt(this.currentHourShow) &&
      this.currentDate.getDate() === this.selectedDate?.getDate() &&
      this.getTimeStateAmOrPm() === 'PM'
    ) {
      const currentMinute = this.currentMinuteCheck.toString();
      const currentMinuteInTwoDigit =
        currentMinute.length === 1 ? '0' + currentMinute : currentMinute;
      if (newValue.length === 1) {
        if (parseInt(newValue) < parseInt(currentMinuteInTwoDigit[0])) {
          $event.preventDefault();
        }
      } else {
        if (parseInt(newValue) < parseInt(currentMinuteInTwoDigit)) {
          $event.preventDefault();
        }
      }
    }
  }

  toggleTimeState(value: string) {
    if (value === 'AM') {
      this.currentHour = this.currentHour - 12;
      this.inputTime = this.currentHourShow + ':' + this.currentMinute + ' AM';
      this.timeChange.emit(this.inputTime);
    } else {
      this.currentHour = this.currentHour + 12;
      this.inputTime = this.currentHourShow + ':' + this.currentMinute + ' PM';
    }
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

  checkCanSwithToAm() {
    if (!this.fromModal) {
      return !(
        this.currentHour > 12 &&
        this.selectedDate?.getDate() !== new Date().getDate()
      );
    } else {
      return false;
    }
  }

  onFocusOut() {
    const currentHourIn12 =
      this.currentHour > 12 ? this.currentHour - 12 : this.currentHour;
    if (
      parseInt(this.currentHourShow) < currentHourIn12 &&
      this.getTimeStateAmOrPm() === 'PM' &&
      this.selectedDate.getDate() === this.currentDate.getDate()
    ) {
      this.currentHourError = true;
      this.buttonDisabled.next(true);
    } else {
      this.currentHourError = false;
      this.buttonDisabled.next(false);
    }
  }

  onFocusOutMinute() {
    const currentHourIn12 =
      this.currentHour > 12 ? this.currentHour - 12 : this.currentHour;
    const currentMinute = this.currentMinuteCheck.toString();
    const currentMinuteInTwoDigit =
      currentMinute.length === 1 ? '0' + currentMinute : currentMinute;
    if (
      parseInt(this.currentHourShow) === currentHourIn12 &&
      parseInt(this.currentMinute) < parseInt(currentMinuteInTwoDigit) &&
      this.getTimeStateAmOrPm() === 'PM' &&
      this.selectedDate.getDate() === this.currentDate.getDate()
    ) {
      this.currentMinuteError = true;
      this.buttonDisabled.next(true);
    } else {
      this.currentMinuteError = false;
      this.buttonDisabled.next(false);
    }
  }

  private currentHourShowWithSixHourPlus() {
    // 6 hour plus to show in the time picker
    let currentHour = 0;
    if (!this.fromModal) {
      currentHour = this.currentHour + 6;
    } else {
      currentHour = this.currentHour;
    }
    const currentHourWithExtraSix =
      currentHour > 23 ? currentHour - 24 : currentHour;
    return currentHourWithExtraSix > 12
      ? (currentHourWithExtraSix - 12).toString()
      : currentHourWithExtraSix.toString();
  }
}
