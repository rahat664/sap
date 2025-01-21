import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { NumberSeperatorPipe } from '../../../../../shared/pipes/number-seperator.pipe';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [NgIf, DecimalPipe, NumberSeperatorPipe],
  templateUrl: './status-card.component.html',
  styleUrl: './status-card.component.scss',
})
export class StatusCardComponent {
  @Input() backgroundColor: string = '#1DBF73';
  @Input() title: string = 'Title';
  @Input() value: number = 0;
  @Input() icon: string = 'icon';
  @Input() textColor: string = '#009D54';
  @Input() text: string;
  protected readonly String = String;
}
