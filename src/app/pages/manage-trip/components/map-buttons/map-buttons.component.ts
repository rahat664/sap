import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-buttons',
  imports: [CommonModule],
  templateUrl: './map-buttons.component.html',
  styleUrl: './map-buttons.component.scss',
})
export class MapButtonsComponent implements OnChanges {
  @Input() statusButtons!: any[];
  @Output() buttonClickEmitter = new EventEmitter<any>();
  @Input() triggerFromParent = false;
  @Input() triggeredButtonName = '';
  @Input() isButtonDisabled = false;

  getButtonColor(button: any) {
    switch (button.name) {
      case 'All':
        return 'bg-black';
      case 'Booked':
        return 'bg-another';
      case 'Completed':
        return 'bg-blue';
      case 'Running':
        return 'bg-green';
      case 'Unassigned':
        return 'bg-red';
      case 'Cancelled':
        return 'bg-cancel';
      default:
        return 'bg-another';
    }
  }

  ngOnChanges(simpleChanges: any) {
    if (
      simpleChanges.triggerFromParent?.currentValue === true &&
      this.triggeredButtonName
    ) {
      this.statusButtons.forEach(statusButton => {
        statusButton.isActive = false;
      });
      this.statusButtons.find(
        statusButton => statusButton.name === this.triggeredButtonName
      ).isActive = true;
    }
  }

  onClickButton(button: any) {
    this.statusButtons.forEach(statusButton => {
      statusButton.isActive = false;
    });
    button.isActive = true;
    this.buttonClickEmitter.emit(button);
  }
}
