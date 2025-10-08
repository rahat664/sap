import { Component } from '@angular/core';
import { StatisticsDetail, StatisticsSummary } from '../../../profiles/components/truck/models/vehicles-statics.model';
import { Router } from '@angular/router';
import { truckFileType } from '../../../profiles/components/truck/models/truck-file-type';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-workshop-records',
  imports: [
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './workshop-records.component.html',
  styleUrl: './workshop-records.component.scss',
})
export class WorkshopRecordsComponent {
  protected readonly truckFileType = truckFileType;
  totalPages: number = 0;
  statisticsDetails: StatisticsDetail[] = [];
  loading: any;
  height: string;
  displayedStatisticsColumns: {
    name: string;
    value: string;
    imageUrl: string;
  }[] = [
    {
      name: 'Completed trips',
      value: 'completedTrip',
      imageUrl: 'completeStat.svg',
    },
    { name: 'Total Run', value: 'totalRun', imageUrl: 'totalRun.svg' },
    {
      name: 'Fuel Consumed',
      value: 'fuelConsumed',
      imageUrl: 'fuelConsumed.svg',
    },
    { name: 'CO2 emitted', value: 'carbonOmitted', imageUrl: 'co2Emitted.svg' },
  ];
  statisticsSummary: StatisticsSummary;

  constructor(private router: Router) {}

  onBottom($event: boolean) {}

  onClickTruckDetails(truck: any) {}

  getHeight() {
    const heightInNumber = Number(this.height.replace('px', ''));
    return heightInNumber + 40 + 'px';
  }

  goBack() {
    window.history.back();
  }

  ngOnInit() {
    const statisticsDetails = JSON.parse(
      localStorage.getItem('detailedStatistics') || '{}'
    );
    statisticsDetails?.length > 0
      ? (this.statisticsDetails = statisticsDetails)
      : [];
    this.statisticsSummary = statisticsDetails;
  }

  goToTripDetails(tripId: string) {
    localStorage.setItem('fromTripListTripId', tripId);
    this.router.navigateByUrl('/manage-trip');
  }

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) document.body.classList.add(className);
    else document.body.classList.remove(className);
  }
}
