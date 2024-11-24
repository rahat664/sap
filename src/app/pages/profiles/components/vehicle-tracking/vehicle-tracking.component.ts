import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
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

@Component({
  selector: 'app-vehicle-tracking',
  standalone: true,
  imports: [
    FormsModule,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgIf,
    CommonModule,
    GMapComponent,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
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
  transporterName: string;
  truckId: string;
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
  transporterSuggestions: any;
  truckRegistrationId: any;
  truckRegSuggestions: any;
  truckSearchSubject: Subject<string> = new Subject();
  transporterSearchSubject: Subject<string> = new Subject();

  constructor(
    private truck: TruckService,
    private transporter: UserService
  ) {
    this.truckSearchSubject.pipe(debounceTime(300)).subscribe(searchText => {
      this.performTruckSearch(searchText);
    });
    this.transporterSearchSubject
      .pipe(debounceTime(300))
      .subscribe(searchText => {
        this.performTransporterSearch(searchText);
      });
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
  }

  onKeyUpTransporterSearch($event: KeyboardEvent) {}

  onClickTransporterSearchSuggestion(option: any) {}

  onKeyUpTruckSearch($event: KeyboardEvent) {}

  onClickTruckSearchSuggestion(option: any) {}

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
  }
}
