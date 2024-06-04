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
  @Input() count: number = 0;
  @Input() Status: string = 'All';
  @Input() isActive: boolean = true;
  @Input() isDisabled: boolean = false;
}
