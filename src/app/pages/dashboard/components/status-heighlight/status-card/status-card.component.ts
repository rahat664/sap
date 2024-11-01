import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [DecimalPipe, NgIf, NgOptimizedImage],
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
}
