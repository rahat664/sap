import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { FormsModule } from '@angular/forms';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { Router } from '@angular/router';
import {
  TransporterDocumentType,
} from '../../../../shared/Enums/registration_type';
import { timer } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile-documents',
  imports: [
    NgForOf,
    FormsModule,
    NgIf,
    UploadButtonComponent,
    FallbackImagePipe,
  ],
  templateUrl: './profile-documents.component.html',
  styleUrl: './profile-documents.component.scss',
})
export class ProfileDocumentsComponent {
  private cachedCheck: boolean | null = null;
  @Input() documentName: string = 'Documents';
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
  @Output() uploadButtonTriggered: EventEmitter<any> = new EventEmitter(false);
  expiryAvailable: any;

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer
  ) {}

  viewAllDocument() {
    sessionStorage.setItem('documentId', this.transporterId);
    this.router.navigate(['/profile/document-viewer'], {
      state: {
        documents: this.documents,
        activatedDocument: this.documents[0],
        id: this.transporterId,
        returnUrl: this.router.url,
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
        return 'Transporter Image';
      case TransporterDocumentType[TransporterDocumentType.NID_FRONT]:
        return 'NID Front';
      case TransporterDocumentType[TransporterDocumentType.NID_BACK]:
        return 'NID Back';
      case TransporterDocumentType[TransporterDocumentType.TRADE_LICENSE]:
        return 'Trade License';
      case TransporterDocumentType[TransporterDocumentType.AGREEMENT]:
        return 'Agreement';
      case TransporterDocumentType[TransporterDocumentType.OTHER_FILE]:
        return 'Other';
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
          imageType: this.changeDocumentNameToGeneralName(
            this.selectedDocumentType
          ),
          expiryAvailable: this.expiryAvailable,
        },
      });
    }
    this.uploadButtonTriggered.emit(true);
  }

  triggerFileUpload(
    documentType: any,
    maxUploadable: any,
    isMultiple: boolean,
    expiryAvailable: any
  ) {
    this.isMultiple = isMultiple;
    this.selectedDocumentType = documentType;
    this.maxUploadable = maxUploadable;
    this.expiryAvailable = expiryAvailable;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.multiple = isMultiple;
      this.fileInput.nativeElement.click();
    }
  }

  checkDateIsExpiredOrNot(expiryDate: string): {
    isExpired: boolean;
    text: string;
  } {
    const pastDate = new Date(expiryDate);
    const currentDate = new Date();

    // Normalize time to midnight for accurate comparison
    pastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Check if the past date is today or in the future
    if (pastDate >= currentDate) {
      return {
        isExpired: false,
        text: `Expiry date: ${this.datePipe.transform(pastDate, 'dd MMM, yyyy') || ''}`,
      };
    }

    // Calculate the time difference in milliseconds
    const timeDiff = currentDate.getTime() - pastDate.getTime();

    // Convert milliseconds to days, months, and years
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const yearDiff = Math.floor(dayDiff / 365);
    const monthDiff = Math.floor((dayDiff % 365) / 30);
    const remainingDays = dayDiff % 30;

    // Build the result string
    const resultParts = [];
    if (yearDiff > 0)
      resultParts.push(`${yearDiff} year${yearDiff > 1 ? 's' : ''}`);
    if (monthDiff > 0)
      resultParts.push(`${monthDiff} month${monthDiff > 1 ? 's' : ''}`);
    if (remainingDays > 0)
      resultParts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);

    return {
      isExpired: true,
      text: `Expired ${resultParts.join(', ')} ago`,
    };
  }

  checkDocumentType(documentType: any) {
    const doc = JSON.parse(sessionStorage.getItem(documentType));
    return {
      uploaded: !!doc,
      preview: doc ? doc[0].base64 : null,
      length: doc ? doc.length : 0,
    };
  }

  shouldShowUploadButton(doc: any): boolean {
    const docCount = this.categorizedDocuments[doc.documentType]?.length || 0;
    const uploaded = this.checkDocumentType(doc.name).uploaded;
    const uploadedCount = this.checkDocumentType(doc.name)?.length || 0;
    const totalCount = docCount + uploadedCount;

    return totalCount < doc.max;
  }

  getUploadIcon(doc: any): string {
    return this.categorizedDocuments[doc.documentType]?.length > 0 ||
      this.checkDocumentType(doc.name).uploaded
      ? 'plus'
      : 'upload';
  }

  getUploadButtonText(doc: any): string {
    return this.categorizedDocuments[doc.documentType]?.length === 0 &&
      !this.checkDocumentType(doc.name).uploaded && doc.max > 0
      ? 'Upload'
      : '';
  }

  getFileOrNot(doc: any) {
    return !(this.categorizedDocuments[doc.documentType]?.length > 0 ||
      this.checkDocumentType(doc.name).uploaded);
  }

  getDateFromSessionStorage(name) {
    switch (name) {
      case 'Trade License':
        return sessionStorage.getItem('tradelicenseexpiry');
      case 'Agreement':
        return sessionStorage.getItem('agreementexpiry');
        default:
          return null;
    }
  }

  viewSpecificDocument(categorizedDocument: any) {
    this.router.navigate(['/profile/document-viewer'], {
      state: {
        documents: categorizedDocument,
        activatedDocument: categorizedDocument[0],
        id: this.transporterId,
        returnUrl: this.router.url,
      },
    });
  }

  isPdf(preSignedFileUrl: any) {
    return preSignedFileUrl?.endsWith('.pdf');
  }
}
