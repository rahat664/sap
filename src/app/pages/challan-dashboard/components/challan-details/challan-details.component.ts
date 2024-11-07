import { Component } from '@angular/core';
import { TripService } from '../../../trip-list/services/trip.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-challan-details',
  standalone: true,
  imports: [],
  templateUrl: './challan-details.component.html',
  styleUrl: './challan-details.component.scss'
})
export class ChallanDetailsComponent {
  constructor(private trip: TripService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {

    });
  }
}
