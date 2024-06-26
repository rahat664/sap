import {Component, Input} from '@angular/core';
import {count} from "rxjs";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-button-chips',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './button-chips.component.html',
  styleUrl: './button-chips.component.scss'
})
export class ButtonChipsComponent {
  @Input() count = 0;
  @Input() Status = 'All';
  @Input() isActive = true;
  @Input() isDisabled = false;
}
