import { Component, OnInit } from '@angular/core';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { truckFileType } from '../../../profiles/components/truck/models/truck-file-type';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { StatisticsDetail, StatisticsSummary } from '../../../profiles/components/truck/models/vehicles-statics.model';
import { Router } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormField, MatInput, MatSuffix } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-statistics-details',
  imports: [
    GiveMaxHeightDirective,
    LoadingComponent,
    NgForOf,
    GetElementHeightDirective,
    NgIf,
    CardComponent,
    MatDatepicker,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatSuffix,
    MatDatepickerToggle,
    MatFormField,
    DatePipe,
    DecimalPipe,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './statistics-details.component.html',
  styleUrl: './statistics-details.component.scss',
})
export class StatisticsDetailsComponent implements OnInit {
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
