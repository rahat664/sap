import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { numberPipe } from '../../../../../shared/pipes/number-seperator.pipe';

@Component({
  selector: 'app-status-card',
  imports: [numberPipe, NgIf],
  templateUrl: './status-card.component.html',
  styleUrl: './status-card.component.scss',
})
export class StatusCardComponent {
  @Input() backgroundColor = '#1DBF73';
  @Input() subtitles = 'Title';
  @Input() value = 0;
  @Input() icon = 'icon';
  @Input() textColor = '#009D54';
  @Input() text: string;
  protected readonly String = String;
  @Input() dateFilterAvailable: boolean = false;
  protected readonly Math = Math;
}
