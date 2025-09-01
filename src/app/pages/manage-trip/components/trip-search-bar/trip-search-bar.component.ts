import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-search-bar.component.html',
  styleUrls: ['./trip-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripSearchBarComponent {
  @Input() loading = false;
  @Input() searchValue = '';
  @Input() filterCount = 0;

  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() openFilter = new EventEmitter<void>();

  onKeyUp(value: string) {
    this.search.emit(value);
  }

  onClear() {
    this.clear.emit();
  }

  onOpenFilter() {
    this.openFilter.emit();
  }
}

