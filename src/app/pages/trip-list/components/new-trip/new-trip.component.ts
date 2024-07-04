import { Component, OnInit } from '@angular/core';
import { CustomDatePickerComponent } from '../../../../shared/modules/custom-date-picker/custom-date-picker.component';
import { GMapComponent } from '../../../../shared/modules/g-map/g-map.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { District, districts } from '../../../../shared/models/ditrict-with-latlng.model';
import { CommonModule } from '@angular/common';
import { GeolocationService } from '../../../../shared/services/location/geolocation.service';

declare var google: any;

@Component({
  selector: 'app-new-trip',
  standalone: true,
  imports: [
    CustomDatePickerComponent,
    GMapComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './new-trip.component.html',
  styleUrl: './new-trip.component.scss',
})
export class NewTripComponent implements OnInit {
  tripCreateForm: FormGroup;
  startingPoint: any;
  destinationPoint: any;
  private districts: District[];
  unloadingDistrictSuggestions: District[];
  loadingDistrictSuggestions: District[];
  loadingDistrictSuggestionsShow: boolean = false;
  unloadingDistrictSuggestionsShow: boolean = false;

  constructor(private fb: FormBuilder, private geoLocation: GeolocationService) {
    this.tripCreateForm = this.fb.group({
      companyName: ['', [Validators.required]],
      loadingDistrict: [''],
      unloadingDistrict: [''],
    });
  }

  onKeyUpUnloadingSearch($event: KeyboardEvent) {
    this.districts = districts;
    this.unloadingDistrictSuggestions = this.districts.filter(district => district.nameEnglish.toLowerCase().includes(($event.target as HTMLInputElement).value.toLowerCase()));
    this.unloadingDistrictSuggestionsShow = true;
  }

  onKeyUpStartingSearch($event: KeyboardEvent) {
    this.districts = districts;
    this.loadingDistrictSuggestions = this.districts.filter(district => district.nameEnglish.toLowerCase().includes(($event.target as HTMLInputElement).value.toLowerCase()));
    this.loadingDistrictSuggestionsShow = true;
  }

  onSelectLoadingDistrict(suggestion: District) {
    this.startingPoint = { lat: Number(suggestion.latitude), lng: Number(suggestion.longitude) };
    this.tripCreateForm.get('loadingDistrict').setValue(suggestion.nameEnglish);
    this.loadingDistrictSuggestionsShow = false;
  }

  onSelectUnloadingDistrict(suggestion: District) {
    this.destinationPoint = { lat: Number(suggestion.latitude), lng: Number(suggestion.longitude) };
    this.tripCreateForm.get('unloadingDistrict').setValue(suggestion.nameEnglish);
    this.unloadingDistrictSuggestionsShow = false;
  }

  ngOnInit(): void {
    this.geoLocation.searchLocation('dhanmondi').subscribe((res: any) => {
      console.log();
      this.geoLocation.getPlaceDetails(res.suggestions[0].placePrediction.placeId).subscribe((res: any) => {
        console.log(res.result.geometry.location);
      });
    });
  }
}
