import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-file-upload-popup',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './file-upload-popup.component.html',
  styleUrl: './file-upload-popup.component.scss'
})
export class FileUploadPopupComponent {
  fileForm: FormGroup;
  file: File | null = null;
  constructor(private fb: FormBuilder) {
    this.fileForm = this.fb.group({
      fileInput: ['']
    });
  }
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.file = event.dataTransfer.files[0];
      console.log('Dropped file:', this.file);
      this.fileForm.patchValue({
        fileInput: this.file.name
      });
    }
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
