import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../../../auth/models/response/trip';
import { TripCardComponent } from '../../../../shared/modules/trip-card/trip-card.component';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';

@Component({
  selector: 'app-trip-list-view',
  standalone: true,
  imports: [CommonModule, TripCardComponent, GiveMaxHeightDirective],
  templateUrl: './trip-list-view.component.html',
  styleUrls: ['./trip-list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripListViewComponent {
  @Input() loading = false;
  @Input() filterOpen = false;
  @Input() filterLength = 0;
  @Input() height: any;
  @Input() filterHeight: any;
  @Input() totalPages = 0;
  @Input() tripList: Trip[] = [];
  @Input() activatedId: string = '';
  @Input() anotherItemsHeight: any;

  @Output() inBottomEnd = new EventEmitter<boolean>();
  @Output() tripSelected = new EventEmitter<Trip>();

  onScrollBottomReached(ev: boolean) {
    this.inBottomEnd.emit(ev);
  }

  onTripClick(trip: Trip) {
    this.tripSelected.emit(trip);
  }

  trackByTripId(index: number, trip: Trip) {
    return (trip as any)?.tripId ?? index;
  }

  buildRegistration(truck: any): string {
    if (!truck) return 'Not Assigned';
    if (truck.fullRegistrationNumber) return truck.fullRegistrationNumber;
    const z = truck.registrationZone || '';
    const c = truck.registrationCategory || '';
    const s = truck.registrationSerial || '';
    const n = truck.registrationNum || '';
    const sep = s && n ? '-' : '';
    return `${z} ${c} ${s}${sep}${n}`.trim() || 'Not Assigned';
  }
}
