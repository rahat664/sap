import { Component } from '@angular/core';
import { GlobalImageUploadComponent } from '../../../../../shared/modules/global-image-upload/global-image-upload.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transporter-nid-upload',
  standalone: true,
  imports: [GlobalImageUploadComponent],
  templateUrl: './transporter-nid-upload.component.html',
  styleUrl: './transporter-nid-upload.component.scss',
})
export class TransporterNidUploadComponent {
  expiryAvailable: boolean = false;
  notesAvailable: boolean = false;
  transporterDocuments: any[];
  transporterDocumentFiles: any[];
  protected imageTypes: any[];
  private eventTypeId: null;
  private type: null;
  private returnUrl: any;
  loading: boolean;

  constructor(private router: Router) {}

  ngOnInit() {
    this.resetNavigationInformation();
    this.getNavigationInformation();
  }

  private resetNavigationInformation() {
    this.expiryAvailable = false;
    this.notesAvailable = false;
    this.transporterDocuments = [];
    this.transporterDocumentFiles = [];
    this.imageTypes = [];
    this.eventTypeId = null;
    this.type = null;
  }

  private getNavigationInformation() {
    const navigation = history.state;
    if (navigation) {
      this.previewDocuments(navigation.addedTransporterDocument);
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
          this.transporterDocuments.push(reader.result);
          this.transporterDocumentFiles.push({
            file: tripDocuments[i],
            preview: reader.result,
          });
        };
      }
    }
  }

  onClickSave($event: boolean) {
    this.router.navigate([this.returnUrl], {
      state: {
        addedTransporterDocument: this.transporterDocumentFiles,
        imageType: this.imageTypes,
      },
    });
  }

  onDocumentClose($event: any) {
    this.transporterDocuments.splice($event.index, 1);
    this.transporterDocumentFiles.splice($event.index, 1);
  }

  onBackButtonClick($event: boolean) {
    this.router.navigate([this.returnUrl]);
  }
}
