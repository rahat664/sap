import { Component, EventEmitter, Output } from '@angular/core';
import { MatRadioButton, MatRadioChange } from '@angular/material/radio';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-off-canvas',
  imports: [MatRadioButton, MatFormField, FormsModule, MatInput],
  templateUrl: './off-canvas.component.html',
  styleUrl: './off-canvas.component.scss',
})
export class OffCanvasComponent {
  @Output() closeCanvas: EventEmitter<void> = new EventEmitter<void>();
  paymentStatus: string;
  amount: any;

  onClose() {
    this.closeCanvas.emit();
  }

  onPaymentStatusChange($event: MatRadioChange) {}

  onPayNow() {

  }
}
