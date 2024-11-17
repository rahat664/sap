import { Component, Input } from '@angular/core';
import {
  GlobalImageUploadComponent
} from '../../../../shared/modules/global-image-upload/global-image-upload.component';
import { DatePipe, NgIf } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-challan-image-upload',
  standalone: true,
  imports: [
    GlobalImageUploadComponent,
    DatePipe,
    MatFormField,
    MatInput,
    MatOption,
    MatSelect,
    NgIf,
  ],
  templateUrl: './challan-image-upload.component.html',
  styleUrl: './challan-image-upload.component.scss',
})
export class ChallanImageUploadComponent {
  currentDate: Date = new Date();
  imageTypes: any[] = [];
  months: any[] = [
    { value: '1', viewValue: 'January' },
    { value: '2', viewValue: 'February' },
    { value: '3', viewValue: 'March' },
    { value: '4', viewValue: 'April' },
    { value: '5', viewValue: 'May' },
    { value: '6', viewValue: 'June' },
    { value: '7', viewValue: 'July' },
    { value: '8', viewValue: 'August' },
    { value: '9', viewValue: 'September' },
    { value: '10', viewValue: 'October' },
    { value: '11', viewValue: 'November' },
    { value: '12', viewValue: 'December' },
  ];
  private tripId: any;
  protected tripDocuments: any[] = [];
  expiryAvailable:  boolean = false;
  notesAvailable: boolean = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    console.log(this.router.getCurrentNavigation())
    const navigation = history.state;
    if (navigation) {
      this.tripId = navigation.tripId;
      this.tripDocuments = navigation.addedTripDocument;
      this.imageTypes  = navigation.imageType
      this.notesAvailable = navigation.noteAvailable;
      this.expiryAvailable = navigation.expiryAvailable;
      console.log(navigation);
    }

  }

  ngAfterContentInit() {

  }

  onChangeImageType($event: MatSelectChange) {}
}
