import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-chips-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-chips-summary.component.html',
  styleUrls: ['./filter-chips-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipsSummaryComponent {
  @Input() filterValues: any[] = [];
  @Input() selectedTruckValues: string[] = [];
  @Input() dateText = '';
  @Input() customDateText = '';
  @Input() customSelected = false;
  @Input() buttonName: any[] = [];
  @Input() paymentTypePlaceholder = '';
  @Input() tripTypePlaceholder = '';

  @Output() closeFilter = new EventEmitter<string>();
  @Output() closePaymentType = new EventEmitter<void>();
  @Output() closeTripType = new EventEmitter<void>();

  onClose(filter: string) {
    this.closeFilter.emit(filter);
  }
}

