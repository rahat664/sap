import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { debounceTime, Subject } from 'rxjs';
import { TruckService } from '../truck/services/truck.service';
import { UserService } from '../../services/user.service';
import { TruckingMapComponent } from './trucking-map/trucking-map.component';
import { TruckModel } from '../truck/models/truck.model';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';

@Component({
  selector: 'app-vehicle-tracking',
  standalone: true,
  imports: [
    FormsModule,
    GetElementHeightDirective,
    NgIf,
    CommonModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    TruckingMapComponent,
  ],
  templateUrl: './vehicle-tracking.component.html',
  styleUrl: './vehicle-tracking.component.scss',
})
export class VehicleTrackingComponent {
  height: string;
  totalPages: number = 0;
  filterOpened: boolean = true;
  transporterFilterCount: number = 0;
  truckFilterCount: number = 0;
  transporterName: string = '';
  truckId: string = '';
  destination: google.maps.LatLngLiteral[] = [
    {
      lat: 12.9716,
      lng: 77.5946,
    },
  ];
  starting: google.maps.LatLngLiteral[] = [
    {
      lat: 12.9716,
      lng: 77.5946,
    },
  ];
  transporterSuggestions: any = [];
  truckRegistrationId: any = '';
  truckRegSuggestions: any = [];
  truckSearchSubject: Subject<string> = new Subject();
  transporterSearchSubject: Subject<string> = new Subject();
  condition: string = '';
  trackerEnabledTrucks: TruckModel[] = [];
  conditionList: any = [
    {
      id: 1,
      value: '',
      viewValue: 'All',
      backgroundColor: 'bg-[#F9F9F9]',
      color: 'text-not-black',
      count: 0,
    },
    {
      id: 2,
      value: 'Running',
      viewValue: 'Running',
      backgroundColor: 'bg-[#1DBF73]',
      color: 'text-white',
      count: 0,
    },
    {
      id: 3,
      value: 'Booked',
      viewValue: 'Booked',
      backgroundColor: 'bg-[#FFA50B]',
      color: 'text-white',
      count: 0,
    },
    {
      id: 4,
      value: 'Stopped',
      viewValue: 'Stopped',
      backgroundColor: 'bg-[#F0614E]',
      color: 'text-white',
      count: 0,
    },
    {
      id: 5,
      value: 'Idle',
      viewValue: 'Idle',
      backgroundColor: 'bg-[#721707]',
      color: 'text-white',
      count: 0,
    },
    {
      id: 5,
      value: 'Unavailable',
      viewValue: 'No data',
      backgroundColor: 'bg-[#5D5D5D]',
      color: 'text-white',
      count: 0,
    },
  ];
  truckLocationPosition: any[] = [];

  constructor(
    private truck: TruckService,
    private transporter: UserService,
    private geoLocation: GeolocationService
  ) {
    this.truckSearchSubject.pipe(debounceTime(300)).subscribe(searchText => {
      this.performTruckSearch(searchText);
    });
    this.transporterSearchSubject
      .pipe(debounceTime(300))
      .subscribe(searchText => {
        this.performTransporterSearch(searchText);
      });
    this.loadGoogleMapsScript();
  }

  private loadGoogleMapsScript() {
    this.geoLocation.loadGoogleMapsScript().then(() => {
      this.geoLocation.getCurrentPosition().then(coords => {});
    });
  }

  ngOnInit() {
    this.truckLocationPosition = [];
    this.getTruckList();
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
  }

  getFilterLength() {
    return this.transporterFilterCount + this.truckFilterCount;
  }

  onClearFilter() {
    this.transporterName = '';
    this.truckId = '';
    this.transporterFilterCount = 0;
    this.truckFilterCount = 0;
    this.truckLocationPosition = [];
    this.trackerEnabledTrucks = [];
    this.getTruckList();
  }

  onKeyUpTransporterSearch($event: any) {
    const value = $event.target.value;
    this.transporterSearchSubject.next(value);
  }

  onClickTransporterSearchSuggestion(option: any) {
    this.transporterName = option.name;
    this.truckLocationPosition = [];
    this.transporterSuggestions = [];
    this.transporterFilterCount = 1;
    this.trackerEnabledTrucks = [];
    this.getTruckList();
  }

  onKeyUpTruckSearch($event: any) {
    const value = $event.target.value;
    this.truckSearchSubject.next(value);
  }

  onClickTruckSearchSuggestion(option: any) {
    this.truckRegistrationId = option.fullRegistrationNumber;
    this.truckLocationPosition = [];
    this.truckRegSuggestions = [];
    this.truckFilterCount = 1;
    this.trackerEnabledTrucks = [];
    this.getTruckList();
  }

  private performTruckSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.truck.getTruckList(0, 100, searchText).subscribe((truck: any) => {
        this.truckRegSuggestions = truck.data.responses;
        if (this.truckRegSuggestions.length === 0) {
          this.truckRegSuggestions.push('No trip found');
        }
      });
    } else {
      this.resetTruckSearch();
    }
  }

  private resetTruckSearch() {
    this.truckRegistrationId = '';
    this.truckRegSuggestions = [];
    this.truckRegSuggestions.push('No truck found');
    this.truckFilterCount = 0;
    this.trackerEnabledTrucks = [];
    this.truckLocationPosition = [];
    this.getTruckList();
  }

  private performTransporterSearch(searchText: string) {
    if (searchText?.length > 0) {
      this.transporter
        .getTransporter(0, 100, searchText)
        .subscribe((transporter: any) => {
          this.transporterSuggestions = transporter.data.responses;
          if (this.transporterSuggestions.length === 0) {
            this.transporterSuggestions.push('No trip found');
          }
        });
    } else {
      this.resetTransporterSearch();
    }
  }

  private resetTransporterSearch() {
    this.transporterName = '';
    this.truckRegSuggestions = [];
    this.truckRegSuggestions.push('No trip found');
    this.transporterFilterCount = 0;
    this.truckLocationPosition = [];
    this.trackerEnabledTrucks = [];
    this.getTruckList();
  }

  private getTruckList() {
    // reusable truck list
    this.truck
      .getTruckList(
        0,
        1000,
        this.truckRegistrationId,
        '',
        true,
        this.transporterName,
        this.condition
      )
      .subscribe((truck: any) => {
        this.trackerEnabledTrucks = truck.data.responses;
        this.getCondtionCount(truck?.data?.conditionCount);
        this.getLastRecordedLocation(truck.data.responses);
      });
  }

  private getCondtionCount(conditionCount: any) {
    for (let i = 0; i < this.conditionList.length; i++) {
      this.conditionList[i].count =
        conditionCount[
          this.conditionList[i].value
            ? this.conditionList[i].value
            : this.conditionList[i].viewValue
        ];
    }
  }

  onClickCondition(condition: any) {
    this.truckLocationPosition = [];
    if (condition.value === 'All') {
      this.condition = '';
    } else {
      this.condition = condition.value;
    }
    this.trackerEnabledTrucks = [];
    this.getTruckList();
  }

  private getLastRecordedLocation(responses: TruckModel[]) {
    responses.forEach((truck: TruckModel) => {
      this.truckLocationPosition.push({
        position: {
          lat: truck.lastRecordedLat,
          lng: truck.lastRecordedLng,
        },
        fullRegistrationNumber: truck.fullRegistrationNumber,
        image: this.getImageNameByCondition(truck.currentCondition),
      }); // add truck location
    });
  }

  private getImageNameByCondition(condition: string) {
    switch (condition) {
      case 'Running':
        return 'running';
      case 'Booked':
        return 'booked';
      case 'Stopped':
        return 'stopped';
      case 'Idle':
        return 'idle';
      case 'Unavailable':
        return 'nodata';
      default:
        return 'nodata';
    }
  }
}
