import { Component, EventEmitter, Output } from '@angular/core';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { paymentMethod } from '../../../pages/profiles/components/transporter/models/payment-method';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-off-canvas',
  imports: [
    MatRadioButton,
    MatFormField,
    FormsModule,
    MatInput,
    NgForOf,
  ],
  templateUrl: './off-canvas.component.html',
  styleUrl: './off-canvas.component.scss',
})
export class OffCanvasComponent {
  paymentMethods: any[] = [
    { name: 'Cash', icon: 'cash.svg' },
    { name: 'Bank', icon: 'bank.svg' },
    { name: 'MFS', icon: 'mfs.svg' },
  ];
  @Output() closeCanvas: EventEmitter<void> = new EventEmitter<void>();
  paymentStatus: string;
  amount: any;

  onClose() {
    this.closeCanvas.emit();
  }

  onPaymentStatusChange($event: MatRadioChange) {}

  onPayNow() {}

  onPaymentMethodChange($event: MatRadioChange) {}
}
