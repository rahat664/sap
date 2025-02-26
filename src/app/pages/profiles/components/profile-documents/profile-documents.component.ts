import { Component, Input, SimpleChanges } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { FormsModule } from '@angular/forms';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { MatDatepicker } from '@angular/material/datepicker';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-documents',
  imports: [NgForOf, FormsModule, NgIf, UploadButtonComponent],
  templateUrl: './profile-documents.component.html',
  styleUrl: './profile-documents.component.scss',
})
export class ProfileDocumentsComponent {
  @Input() documentName: string = 'Document Name';
  @Input() documentTypes: any[] = [];
  @Input() documents: any[] = [];
  @Input() isInEditMode: boolean = false;
  categorizedDocuments: { [key: string]: any[] } = {};
  @Input() transporterId: any;

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
    documentType = documentType.replace(/_/g, ' ');
    return documentType.charAt(0).toUpperCase() + documentType.slice(1);
  }
}
