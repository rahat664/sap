import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-create-popup',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './create-popup.component.html',
  styleUrl: './create-popup.component.scss'
})
export class CreatePopupComponent {
  @Input() isOpen: boolean = false;
  @Output() isModalClosed: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  closeModal() {
    this.isOpen = false;
    this.isModalClosed.emit(true);
  }
}
