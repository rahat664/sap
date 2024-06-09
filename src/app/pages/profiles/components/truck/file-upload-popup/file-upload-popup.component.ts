import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {CustomInputSelectModel} from "../../../../../shared/modules/custom-input/custom-input-select.model";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {fileUpload} from "../models/file-upload";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-file-upload-popup',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    CommonModule
  ],
  templateUrl: './file-upload-popup.component.html',
  styleUrl: './file-upload-popup.component.scss'
})
export class FileUploadPopupComponent {
  file: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  @Input() fileTypeOptions: CustomInputSelectModel[] = fileUpload;
  fileInputPlaceholder: string = '';
  fileOpened: boolean;
  @Input() isUploadIconEnabled: boolean = true;
  @Input() padding: string= '4';
  @Output() fileInput: EventEmitter<any> = new EventEmitter<any>();
  fileArray: any[] = [];
  constructor() {
    this.fileArray = [];
  }
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      this.previewFile(file);
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

  onSelectFileType($event: number, i: number) {
    this.fileInputPlaceholder = this.fileTypeOptions.find(option => option.id === $event).value;
    this.fileArray[i].registrationType = this.fileInputPlaceholder;
  }

  onClickFileType($event: boolean, i: number) {
    this.fileArray[i].fileOpened = $event;
  }
  onSubmit() {
    this.fileInput.emit(this.fileArray);
    this.filePreview = null;
  }

  previewFile(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.filePreview = reader.result;
      this.fileArray.push({file: file, preview: this.filePreview, registrationType: null, registrationExpireDate: null , fileOpened: false});
    };
  }

  onFileChange($event: any) {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      if (file) {
        this.previewFile(file);
      }
    }
  }


  onDateChange($event: Event, i: number) {
    this.fileArray[i].registrationExpireDate = ($event.target as HTMLInputElement).value;
  }
}
