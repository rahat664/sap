import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { CommonModule, DatePipe } from '@angular/common';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';

@Component({
  selector: 'app-file-upload-popup',
  standalone: true,
  imports: [
    CustomInputComponent,
    CommonModule,
    MatFormField,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatInput,
    ReactiveFormsModule,
    FormsModule,
    MatSuffix,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './file-upload-popup.component.html',
  styleUrl: './file-upload-popup.component.scss',
})
export class FileUploadPopupComponent implements OnChanges {
  readonly dialogRef = inject(MatDialogRef<FileUploadPopupComponent>);
  file: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  @Input() fileTypeOptions: CustomInputSelectModel[] | null = [];
  fileOpened: boolean;
  @Input() isUploadIconEnabled = true;
  @Input() padding = '4';
  @Output() fileInput: EventEmitter<any> = new EventEmitter<any>();
  @Input() fileArray: any[] = [];
  @Input() callFromModal: boolean;
  @Input() isExpiryAvailable!: boolean;
  @Input() isFromDriver!: boolean;
  @Input() isNewOpen!: any;
  @Input() singleDriver: any;
  @Input() singleTruck: any;
  @Input() isFromTruck!: boolean;
  newFileType: any;

  constructor(
    private sharedDriverEditService: DriverEditSharedService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: HandleToastrService
  ) {}

  ngOnInit() {
    this.fileArray = [];
    this.fileInput.emit(this.fileArray);
    this.fileTypeOptions = this.data?.filetype;
  }

  ngOnChanges(changes: SimpleChanges) {}

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files?.length) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.previewFile(file);
      }
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

  onSelectFileType($event: any, i: number) {
    this.data?.filetype.forEach((element: any) => {
      if (element.id == $event) {
        this.fileArray[i].registrationType = element.value;
      }
    });
    this.fileArray[i].registrationOptions = this.fileTypeOptions;
    this.fileOpened = false;
  }

  @Output() modalClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() isUploadDisabled: boolean = false;

  onSubmit() {
    // remove the file from the file array if expiry not required for that filled like Nid front, Nid back, Driving License Front, Driving License Back, Other
    let newFileArray = JSON.parse(JSON.stringify(this.fileArray));
    newFileArray = newFileArray.filter(
      (file: { registrationType: string }) =>
        file.registrationType !== 'Other' &&
        file.registrationType !== 'NID Front' &&
        file.registrationType !== 'NID Back' &&
        file.registrationType !== 'Driving License Back' &&
        file.registrationType !== 'Registration Paper'
    );

    console.log(newFileArray);

    const isExpiryFilled = newFileArray.every(
      (file: { registrationExpireDate: null }) =>
        file.registrationExpireDate !== null
    );

    if (this.data?.from === 'driver') {
      this.handleDriverSubmission(isExpiryFilled);
    } else if (this.data?.from === 'truck') {
      this.handleTruckSubmission(isExpiryFilled);
    } else {
      this.fileArray = [];
    }
  }

  private handleDriverSubmission(isExpiryFilled: boolean) {
    if (isExpiryFilled || this.excludeExpiryField(this.fileArray)) {
      this.fileInput.emit(this.fileArray);
      this.dialogRef.close(this.fileArray);
      this.sharedDriverEditService.getDocument(this.data?.value);
      this.sharedDriverEditService.bindDriverValueWithForm(this.data?.value);
      this.sharedDriverEditService.onChangeFile(this.fileArray);
      this.sharedDriverEditService.onDriverUpdate(
        this.data?.value?.name,
        this.data?.value?.phone
      );
      this.sharedDriverEditService.completeUpload.subscribe(res => {
        if (res) {
          this.fileArray = [];
        }
      });
    } else {
      this.toastr.showError('Please fill the expiry date of all files');
    }
  }

  private handleTruckSubmission(isExpiryFilled: boolean) {
    if (isExpiryFilled || this.excludeExpiryField(this.fileArray)) {
      this.fileInput.emit(this.fileArray);
      this.dialogRef.close(this.fileArray);
      this.sharedDriverEditService.getTruckDocument(this.data?.value);
      this.sharedDriverEditService.bindTruckValueWithForm(this.data?.value);
      this.sharedDriverEditService.onChangeTruckFile(this.fileArray);
      this.sharedDriverEditService.onTruckUpdate();
      this.sharedDriverEditService.completeUpload.subscribe(res => {
        if (res) {
          this.fileArray = [];
        }
      });
    } else {
      this.toastr.showError('Please fill the expiry date of all files');
    }
  }

  previewFile(file: File) {
    if (file.type === 'application/pdf') {
      const fileURL = URL.createObjectURL(file);
      this.fileArray.push({
        preview: fileURL,
        file: file,
        registrationType: null,
        registrationExpireDate: null,
        fileOpened: false,
        registrationOptions: this.newFileType,
        expiryAvailable: false,
      });
      return;
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.fileArray.push({
          file: file,
          preview: reader.result,
          registrationType: null,
          registrationExpireDate: null,
          fileOpened: false,
          registrationOptions: this.newFileType,
          expiryAvailable: false,
        });
      };
    }
    let reader = new FileReader();

    // Read the file as Data URL (preview)

    reader.readAsDataURL(file);
    reader.onload = () => {
      this.fileArray.push({
        file: file,
        preview: reader.result,
        registrationType: null,
        registrationExpireDate: null,
        fileOpened: false,
        registrationOptions: this.newFileType,
        expiryAvailable: false,
      });
      this.fileInput.emit(this.fileArray);
    };

    reader.onerror = error => {
      console.error('Error reading file:', error);
      // Handle error if needed
    };
  }

  // This function will clear the file data from memory (useful after uploading or previewing)
  clearFileData(index: number) {
    const fileItem = this.fileArray[index];
    if (fileItem) {
      // Clear the preview and reset other properties if needed
      fileItem.preview = null;
      fileItem.file = null; // Optionally remove the file from the object
    }
  }

  onFileChange($event: any) {
    this.isExpiryAvailable = false;
    if ($event.target.files?.length > 0) {
      const file = $event.target.files[0];
      if (file) {
        this.previewFile(file);
        // make the file input empty
        $event.target.value = '';
      }
    }
  }

  selectedDate: any = new Date();

  onDateChange($event: any, i: number) {
    this.selectedDate = $event.target.value;
    this.fileArray[i].registrationExpireDate = this.datePipe.transform(
      this.selectedDate,
      'yyyy-MM-ddTHH:mm:ss'
    );
  }

  onCloseSelectedFile(i: number) {
    this.fileArray.splice(i, 1);
    this.fileInput.emit(this.fileArray);
  }

  onClose() {
    this.dialogRef.close('close');
  }

  private excludeExpiryField(fileArray: any[]) {
    return fileArray.every(
      file =>
        file.registrationType === 'Other' ||
        file.registrationType === 'NID Front' ||
        file.registrationType === 'NID Back' ||
        file.registrationType === 'Registration Paper' ||
        file.registrationType === 'Driving License Back'
    );
  }

  onClickPdfDocument(file: File) {}
}
