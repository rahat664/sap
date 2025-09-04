import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
import { MapButtonsComponent } from '../map-buttons/map-buttons.component';
import { TripDetailsComponent } from '../trip-details/trip-details.component';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';

@Component({
  selector: 'app-mobile-trip-details',
  standalone: true,
  imports: [CommonModule, GMapComponent, MapButtonsComponent, TripDetailsComponent, GetElementHeightDirective],
  templateUrl: './mobile-trip-details.component.html',
  styleUrls: ['./mobile-trip-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileTripDetailsComponent {
  @Input() loading = false;
  @Input() singleTripDetails: any;
  @Input() activatedTruckSizeInFeet = 0;
  @Input() truckRegistrationNumbers = '';
  @Input() truckLocationPosition: { lng: number; lat: number };
  @Input() truckerEnabled = false;
  @Input() startingPosition: { lng: number; lat: number }[] = [];
  @Input() destinationPosition: { lng: number; lat: number }[] = [];
  @Input() tripStatus = '';
  @Input() triggerFromParentName = '';
  @Input() isTriggerFromParent = false;
  @Input() statusButtons: any[] = [];

  @Output() back = new EventEmitter<void>();
  @Output() clearInput = new EventEmitter<boolean>();
  @Output() buttonClickEmitter = new EventEmitter<any>();
  @Output() height = new EventEmitter<any>();
  @Output() foldUnfoldChange = new EventEmitter<boolean>();
}

