import { Component } from '@angular/core';
import { GlobalImageUploadComponent } from '../../../../shared/modules/global-image-upload/global-image-upload.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TripService } from '../../../trip-list/services/trip.service';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';

@Component({
  selector: 'app-challan-image-upload',
  standalone: true,
  imports: [GlobalImageUploadComponent],
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
  tripId: any;
  protected tripDocuments: any[] = [];
  protected tripDocumentFiles: any[] = [];
  expiryAvailable: boolean = false;
  notesAvailable: boolean = false;
  returnUrl: string;
  private notes: string;
  private eventTypeId: number;
  private type: string;
  loading: boolean;

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private trip: TripService,
    private toastr: HandleToastrService
  ) {}

  ngOnInit() {
    this.resetNavigationInformation();
    this.getNavigationInformation();
  }

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
      this.imageTypes = navigation.imageType;
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
            preview: reader.result,
          });
        };
      }
    }
  }

  onDocumentClose($event: any) {
    // remove the document from the list
    this.tripDocumentFiles = this.tripDocumentFiles.filter(
      doc => doc.preview !== $event
    );
    if (this.tripDocumentFiles.length === 1) {
      this.resetNavigationInformation();
      this.router.navigate([this.returnUrl]);
    }
  }

  onClickSave($event: boolean) {
    this.loading = true;
    if ($event) {
      if (this.currentDate && this.eventTypeId) {
        const request = {
          tripPointNo: this.tripId,
          tripPointEventTypeId: this.eventTypeId,
          dateTime: this.datePipe.transform(
            this.currentDate,
            'yyyy-MM-ddTHH:mm:ss'
          ),
          type: this.type,
        };

        if (this.notes) {
          request['note'] = this.notes;
        }

        const files = [];
        this.tripDocumentFiles?.forEach(doc => {
          files.push(doc.file);
        });

        // convert the request and files into formData
        const formData = new FormData();

        formData.append(
          'request',
          new Blob([JSON.stringify(request)], { type: 'application/json' })
        );
        files.forEach(doc => {
          formData.append('files', doc);
        });

      this.trip.manageLoadingUnloading(formData).subscribe(
        (response: any) => {
          if (response.status === 'OK') {
            this.loading = false;
            this.toastr.showSuccess(response.message);
            this.router.navigate([this.returnUrl]);
          } else {
            this.loading = false;
            this.toastr.showError(response.message);
          }
        },
        error => {
          this.loading = false;
          this.toastr.showError(error.message);
        }
      );
    } else {
      this.loading = false;
      this.toastr.showError('Please select the required fields');
    }
  }

  onForwardedNote($event: string) {
    this.notes = $event;
  }

  onSelectImageType($event: string) {
    if ($event === 'Loading Challan') {
      this.eventTypeId = 6;
    } else if ($event === 'Unloading Challan') {
      this.eventTypeId = 11;
    }
  }

  onSelectDateAndTime($event: string) {
    if ($event) {
      this.currentDate = new Date($event);
      console.log(this.currentDate);
    }
  }

  onBackButtonClick($event: boolean) {
    if ($event) {
      this.router.navigate([this.returnUrl]);
    }
  }
}
