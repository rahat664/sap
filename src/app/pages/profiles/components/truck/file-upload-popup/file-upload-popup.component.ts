import {Component, Input} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CustomInputComponent} from "../../../../../shared/modules/custom-input/custom-input.component";
import {CustomInputSelectModel} from "../../../../../shared/modules/custom-input/custom-input-select.model";
import {GetClickEventDirective} from "../../../../../shared/directive/get-click-event.directive";
import {fileUpload} from "../models/file-upload";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-file-upload-popup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CustomInputComponent,
    GetClickEventDirective,
    NgIf
  ],
  templateUrl: './file-upload-popup.component.html',
  styleUrl: './file-upload-popup.component.scss'
})
export class FileUploadPopupComponent {
  fileForm: FormGroup;
  file: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  fileTypeOptions: CustomInputSelectModel[] = fileUpload;
  fileInputPlaceholder: string = '';
  fileOpened: boolean;
  @Input() isUploadIconEnabled: boolean = true;
  @Input() padding: string= '4';
  constructor(private fb: FormBuilder) {
    this.fileForm = this.fb.group({
      fileInput: [null, Validators.required],
    });
  }
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      this.fileForm.get('fileInput')!.patchValue(file);
      this.fileForm.get('fileInput')!.updateValueAndValidity();
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

  onSelectFileType($event: number) {
    this.fileInputPlaceholder = this.fileTypeOptions.find(option => option.id === $event).value;
  }

  onClickFileType($event: boolean) {
    this.fileOpened = $event;
  }
  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.fileForm.get('fileInput')!.value);
    console.log(formData.get('file'));
    console.log(this.fileForm)
  }

  previewFile(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.filePreview = reader.result;
    };
  }

  onFileChange($event: any) {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      this.fileForm.get('fileInput')!.patchValue(file);
      this.fileForm.get('fileInput')!.updateValueAndValidity();
      this.previewFile(file);
    }
  }
}
