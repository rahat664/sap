import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { FormsModule } from '@angular/forms';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { Router } from '@angular/router';
import {
  TransporterDocumentType,
} from '../../../../shared/Enums/registration_type';

@Component({
  selector: 'app-profile-documents',
  imports: [NgForOf, FormsModule, NgIf, UploadButtonComponent],
  templateUrl: './profile-documents.component.html',
  styleUrl: './profile-documents.component.scss',
})
export class ProfileDocumentsComponent {
  @Input() documentName: string = 'Document Name';
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @Input() documentTypes: any[] = [];
  @Input() documents: any[] = [];
  @Input() isInEditMode: boolean = false;
  categorizedDocuments: { [key: string]: any[] } = {};
  @Input() transporterId: any;
  @Input() fromAddDocument: boolean = false;
  maxUploadable: any;
  selectedDocumentType: any;
  isMultiple: boolean = false;
  @Output() onInputFilesReturnToParent: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router) {}

  viewAllDocument() {
    sessionStorage.setItem('documentId', this.transporterId);
    this.router.navigate(['/profile/document-viewer'], {
      state: {
        documents: this.documents,
        activatedDocument: this.documents[0],
        id: this.transporterId,
        returnUrl: this.router.url
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && this.documents?.length > 0) {
      this.categorizeDocuments();
    } else {
      this.categorizedDocuments = this.documentTypes.reduce(
        (acc, type) => {
          acc[type] = [];
          return acc;
        },
        {} as { [key: string]: any[] }
      );
      //fill the categorizedDocuments with empty array
      this.documentTypes.forEach(documentType => {
        this.categorizedDocuments[documentType.documentType] = [];
      });
    }
  }

  categorizeDocuments() {
    this.categorizedDocuments = this.documentTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as { [key: string]: any[] }
    );

    this.documents.forEach(document => {
      if (this.categorizedDocuments[document.documentType]) {
        this.categorizedDocuments[document.documentType].push(document);
      } else {
        // create a document type for the document
        this.categorizedDocuments[document.documentType] = [document];
      }
    });
  }

  changeDocumentNameToGeneralName(documentType: any) {
    switch (documentType) {
      case TransporterDocumentType[TransporterDocumentType.PROFILE_PICTURE]:
        return 'Transporter Image'
      case TransporterDocumentType[TransporterDocumentType.NID_FRONT]:
        return 'NID Front'
      case TransporterDocumentType[TransporterDocumentType.NID_BACK]:
        return 'NID Back'
      case TransporterDocumentType[TransporterDocumentType.TRADE_LICENSE]:
        return 'Trade License'
      case TransporterDocumentType[TransporterDocumentType.AGREEMENT]:
        return 'Agreement'
      case TransporterDocumentType[TransporterDocumentType.OTHER_FILE]:
        return 'Other'
      default:
        return documentType;
    }
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.router.navigate(['/profile/document-upload'], {
        state: {
          documents: files,
          activeDocument: files[0],
          returnUrl: this.router.url,
          imageType: this.changeDocumentNameToGeneralName(this.selectedDocumentType),
        },
      });
    }
  }

  triggerFileUpload(documentType: any, maxUploadable: any, isMultiple: boolean) {
    this.isMultiple = isMultiple;
    this.selectedDocumentType = documentType;
    this.maxUploadable = maxUploadable;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.multiple = isMultiple;
      this.fileInput.nativeElement.click();
    }
  }
}
