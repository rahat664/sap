import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehicle-stats-button',
  imports: [],
  templateUrl: './vehicle-stats-button.component.html',
  styleUrl: './vehicle-stats-button.component.scss'
})
export class VehicleStatsButtonComponent {
  @Input() totalNumber: string;
  @Input() title: string;
  @Input() active: boolean = false;
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }

}
