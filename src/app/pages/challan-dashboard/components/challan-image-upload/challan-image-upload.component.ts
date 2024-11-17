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
import { TripService } from '../../../trip-list/services/trip.service';

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
  protected tripDocumentFiles: any[] = [];
  expiryAvailable:  boolean = false;
  notesAvailable: boolean = false;
  returnUrl: string;
  private notes: string;
  private eventTypeId: number;
  private type: string;

  constructor(private router: Router, private datePipe: DatePipe, private trip: TripService) {
  }

  ngOnInit() {
    this.resetNavigationInformation();
    this.getNavigationInformation();


  }

  ngAfterContentInit() {

  }

  onChangeImageType($event: MatSelectChange) {}

  private resetNavigationInformation() {
    this.expiryAvailable = false;
    this.notesAvailable = false;
    this.tripDocuments = [];
    this.tripDocumentFiles = [];
    this.imageTypes = [];
    this.eventTypeId = null;
    this.type = null;
    this.tripId = null;
  }

  private getNavigationInformation() {
    const navigation = history.state;
    if (navigation) {
      this.tripId = navigation.tripId;
      this.previewDocuments(navigation.addedTripDocument);
      this.imageTypes  = navigation.imageType
      this.notesAvailable = navigation.noteAvailable;
      this.expiryAvailable = navigation.expiryAvailable;
      this.eventTypeId = navigation.eventTypeId;
      this.type = navigation.type;
      this.returnUrl = navigation.returnUrl;
    }
  }

  private previewDocuments(tripDocuments) {
    if (tripDocuments) {
      for (let i = 0; i < tripDocuments.length; i++) {
        const reader = new FileReader();
        reader.readAsDataURL(tripDocuments[i]);
        reader.onload = () => {
          this.tripDocuments.push(reader.result);
          this.tripDocumentFiles.push({
            file: tripDocuments[i],
            preview: reader.result
          });
        }
      }
    }
  }

  onDocumentClose($event: any) {
    // remove the document from the list
    this.tripDocumentFiles = this.tripDocumentFiles.filter(doc => doc.preview !== $event);
    if (this.tripDocumentFiles.length === 1) {
      this.resetNavigationInformation();
      this.router.navigate([this.returnUrl]);
    }
  }


  onClickSave($event: boolean) {
    if ($event) {
      const request = {
        tripPointNo : this.tripId,
        tripPointEventTypeId: this.eventTypeId,
        dateTime: this.datePipe.transform(
          new Date(),
          'yyyy-MM-ddTHH:mm:ss'
        ),
        type: this.type
      }

      if (this.notes) {
        request['note'] = JSON.stringify(this.notes);
      }

      const files = []
      this.tripDocumentFiles?.forEach(doc => {
        files.push(doc.file);
      })

      // convert the request and files into formData
      const formData = new FormData();

      formData.append('request', JSON.stringify(request));
      files.forEach(doc => {
        formData.append('files', doc);
      })

      this.trip.manageLoadingUnloading(formData).subscribe(
        response => {
        }
      )
    }
  }

  onForwardedNote($event: string) {
      this.notes = $event;
  }
}
