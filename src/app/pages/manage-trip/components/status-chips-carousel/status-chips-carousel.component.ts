import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonChipsComponent } from '../../../../pages/trip-list/modules/button-chips/button-chips.component';
import { ScrollByButtonDirective } from '../../../../shared/directive/scroll-by-button.directive';

@Component({
  selector: 'app-status-chips-carousel',
  standalone: true,
  imports: [CommonModule, ButtonChipsComponent, ScrollByButtonDirective],
  templateUrl: './status-chips-carousel.component.html',
  styleUrls: ['./status-chips-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipsCarouselComponent {
  @Input() loading = false;
  @Input() statusButtons: any[] = [];
  @Input() rightButtonClicked = false;
  @Input() leftButtonClicked = false;
  @Input() scrollable = true;

  @Output() statusClick = new EventEmitter<string>();
  @Output() leftClick = new EventEmitter<void>();
  @Output() rightClick = new EventEmitter<void>();
  @Output() scrollableChange = new EventEmitter<boolean>();

  onLeft() { this.leftClick.emit(); }
  onRight() { this.rightClick.emit(); }
  onVisibleChange(v: boolean) { this.scrollableChange.emit(v); }
}
