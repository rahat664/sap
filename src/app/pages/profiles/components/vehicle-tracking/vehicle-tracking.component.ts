import { Component, OnInit } from '@angular/core';
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
import { debounceTime, Subject, timer } from 'rxjs';
import { TruckService } from '../truck/services/truck.service';
import { UserService } from '../../services/user.service';
import { TruckingMapComponent } from './trucking-map/trucking-map.component';
import { TruckModel } from '../truck/models/truck.model';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { TripListFilterComponent } from '../../../trip-list/components/trip-list-filter/trip-list-filter.component';
import { VehicleTrackingFilterComponent } from './vehicle-tracking-filter/vehicle-tracking-filter.component';

@Component({
  selector: 'app-vehicle-tracking',
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
    LoadingComponent,
    GiveMaxHeightDirective,
    TripListFilterComponent,
    VehicleTrackingFilterComponent,
  ],
  templateUrl: './vehicle-tracking.component.html',
  styleUrl: './vehicle-tracking.component.scss',
})
export class VehicleTrackingComponent implements OnInit {
  height: string;
  totalPages = 0;
  filterOpened = false;
  transporterFilterCount = 0;
  truckFilterCount = 0;
  transporterName = '';
  truckId = '';
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
  truckSearchSubject = new Subject<string>();
  allTruckSearchSubject = new Subject<string>();
  transporterSearchSubject = new Subject<string>();
  condition = '';
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
      viewValue: 'Moving',
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
      viewValue: 'Unavailable',
      backgroundColor: 'bg-[#5D5D5D]',
      color: 'text-white',
      count: 0,
    },
  ];
  truckLocationPosition: any[] = [];
  trucklistOpened = true;
  searchTruckValue: any;
  allTruckList: TruckModel[] = [];
  page = 0;
  size = 10;
  truckListLoading = false;
  selectedTruckNumber = '';
  singleTruckButtonDisable: boolean;
   filterData: any = {};
   filterApplied: boolean = false;

  constructor(
    private truck: TruckService,
    private transporter: UserService,
    private geoLocation: GeolocationService
  ) {
    this.truckSearchSubject.pipe(debounceTime(1000)).subscribe(searchText => {
      this.performTruckSearch(searchText);
    });
    this.transporterSearchSubject
      .pipe(debounceTime(1000))
      .subscribe(searchText => {
        this.performTransporterSearch(searchText);
      });
    this.allTruckSearchSubject
      .pipe(debounceTime(1000))
      .subscribe(searchText => {
        this.performAllTruckSearch(searchText);
      });
    this.loadGoogleMapsScript();
  }

  private loadGoogleMapsScript() {
    this.geoLocation.loadGoogleMapsScript().then(() => {
      this.geoLocation.getCurrentPosition().then(coords => {});
    });
  }

  ngOnInit() {
    this.trucklistOpened = true;
    this.truckLocationPosition = [];
    this.getTruckList();
    this.onClickTruckList();
  }

  onClickFilterOpened() {
    this.filterOpened = !this.filterOpened;
  }

  getFilterLength() {
    return this.transporterFilterCount;
  }

  onClearFilter() {
    this.transporterName = '';
    this.truckRegistrationId = '';
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

  onKeyUpAllTruckSearch($event: any) {
    const value = $event.target.value;
    this.allTruckSearchSubject.next(value);
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
      this.truck
        .getTruckList(0, 100, searchText, null, true)
        .subscribe((truck: any) => {
          this.truckRegSuggestions = truck.data.responses;
          if (this.truckRegSuggestions.length === 0) {
            this.truckRegSuggestions.push('No trip found');
          }
        });
    } else {
      this.resetTruckSearch();
    }
  }

  private performAllTruckSearch(searchText: string) {
    this.truckListLoading = true;
    if (searchText?.length > 0) {
      this.truck
        .getTruckList(this.page, this.size, searchText, null, true)
        .subscribe((truck: any) => {
          this.allTruckList = [];
          this.allTruckList = truck.data.responses;
          this.totalPages = truck.data.totalPages;
          this.truckListLoading = false;
        });
    } else {
      this.onClickTruckList();
      this.truckListLoading = false;
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

    if (this.trucklistOpened) {
      this.truckListLoading = true;
      this.allTruckList = [];
      this.page = 0;
      this.size = 10;
      this.onClickTruckList();
    }
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

  onClickTruckList() {
    this.truckListLoading = true;
    this.trucklistOpened = true;
    this.truck
      .getTruckList(
        this.page,
        this.size,
        '',
        null,
        true,
        null,
        this.condition !== 'All' ? this.condition : ''
      )
      .subscribe((truck: any) => {
        this.allTruckList = truck.data.responses;
        this.totalPages = truck.data.totalPages;
        this.truckListLoading = false;
      });
  }

  onClickClear() {
    this.searchTruckValue = '';
    this.allTruckSearchSubject.next('');
    this.truckRegistrationId = '';
    this.truckLocationPosition = [];
    this.trackerEnabledTrucks = [];
    this.getTruckList();
  }

  getColorByConditon(currentCondition: string | undefined, type: string) {
    switch (currentCondition) {
      case 'Running':
        return type === 'border' ? 'border-[#1DBF73]' : 'text-[#1DBF73]';
      case 'Booked':
        return type === 'border' ? 'border-[#FFA50B]' : 'text-[#FFA50B]';
      case 'Stopped':
        return type === 'border' ? 'border-[#F0614E]' : 'text-[#F0614E]';
      case 'Idle':
        return type === 'border' ? 'border-[#721707]' : 'text-[#721707]';
      case 'Unavailable':
        return type === 'border' ? 'border-[#5D5D5D]' : 'text-[#5D5D5D]';
      default:
        return type === 'border' ? 'border-[#F9F9F9]' : 'text-[#5D5D5D]';
    }
  }

  onScrollEnd($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      if (this.searchTruckValue) {
        this.truck
          .getTruckList(
            this.page,
            this.size,
            this.searchTruckValue,
            null,
            true,
            null,
            this.condition !== 'All' ? this.condition : ''
          )
          .pipe(debounceTime(1000))
          .subscribe((res: any) => {
            this.allTruckList.push(...res.data.responses);
          });
      } else {
        this.truck
          .getTruckList(
            this.page,
            this.size,
            null,
            null,
            true,
            null,
            this.condition !== 'All' ? this.condition : ''
          )
          .subscribe((res: any) => {
            this.allTruckList.push(...res.data.responses);
          });
      }
    }
  }

  onClickSingleTruck(fullRegistrationNumber: string | undefined) {
    this.allTruckSearchSubject.next(fullRegistrationNumber);
    this.searchTruckValue = fullRegistrationNumber;
    this.truckRegistrationId = fullRegistrationNumber;
    this.selectedTruckNumber = fullRegistrationNumber;
    this.truckLocationPosition = [];
    this.trackerEnabledTrucks = [];
    this.getTruckList();
    this.singleTruckButtonDisable = true;
    timer(2100).subscribe(() => {
      this.singleTruckButtonDisable = false;
    });
  }

  onHideTruckList() {
    this.page = 0;
    this.size = 10;
    this.trucklistOpened = false;
    this.allTruckList = [];
    this.searchTruckValue = '';
  }

  onFilterData($event: any) {
    this.filterData = $event;
  }

  onClickFilterOpen() {
    this.filterOpened = true;
  }

  get filterSummary(): string {
    const parts: string[] = [];

    if (this.filterData.transporterName)
      parts.push(
        `Payment Type: <b>${this.filterData.transporterName}</b>`
      );

    return parts.join(', ');
  }

  onFilterApply() {
    if (
      this.filterData?.transporterName
    ) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.transporterName = this.filterData.transporterName;
      this.page = 0;
      this.size = 30;
      this.truckLocationPosition = [];
      this.trackerEnabledTrucks = [];
      this.getTruckList();
      this.onClickTruckList();
    } else {
      localStorage.removeItem('tripFilterData');
      this.page = 0;
      this.size = 30;
      this.truckLocationPosition = [];
      this.trackerEnabledTrucks = [];
      this.transporterName = '';
      this.getTruckList();
      this.onClickTruckList();
    }
  }

  onCLickClearAll() {
    localStorage.removeItem('tripFilterData');
    this.filterApplied = false;
    this.filterData = {};
    this.page = 0;
    this.size = 30;
    this.truckLocationPosition = [];
    this.transporterName = '';
    this.trackerEnabledTrucks = [];
    this.getTruckList();
    this.onClickTruckList();
  }

}
