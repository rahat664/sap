import { Component, Input } from '@angular/core';
import { TripData } from '../../model/trip.details.model';

@Component({
  selector: 'app-manual-tracking',
  imports: [],
  templateUrl: './manual-tracking.component.html',
  styleUrl: './manual-tracking.component.scss'
})
export class ManualTrackingComponent {
  @Input() tripDetails!: TripData;

}
