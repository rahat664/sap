import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CustomInputComponent,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    NgForOf,
    NgIf,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSuffix,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  file: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  @Input() fileTypeOptions: CustomInputSelectModel[] | null = [];
  fileInputPlaceholder = '';
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
    private datePipe: DatePipe
  ) {
    this.fileArray = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isNewOpen) {
      this.fileArray = [];
    }
  }

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

  onSelectFileType($event: number, i: number) {
    this.fileInputPlaceholder = this.fileTypeOptions.find(
      option => option.id === $event
    ).value;
    this.fileArray[i].registrationType = this.fileInputPlaceholder;
    if (!this.callFromModal) {
      this.fileInput.emit(this.fileArray);
    }
    this.fileArray[i].fileOpened = false;
    const registrationTypesSet: Set<any> = new Set(
      this.fileArray.map(file => file.registrationType)
    );

    // Assign the filtered options to each file's registrationOptions
    this.fileArray[i].registrationOptions = this.newFileType;
  }

  onClickFileType($event: boolean, i: number) {
    this.fileArray[i].fileOpened = $event;
    this.fileArray[i].registrationOptions = this.fileTypeOptions;
    // Create a set of registration types from fileArray for quick lookup
  }

  @Output() modalClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() isUploadDisabled: boolean = false;

  onSubmit() {
    this.sharedDriverEditService.isUploadPopupOpen.next(false);
    this.fileInput.emit(this.fileArray);
    if (this.isFromDriver) {
      this.sharedDriverEditService.getDocument(this.singleDriver);
      this.sharedDriverEditService.bindDriverValueWithForm(this.singleDriver);
      this.sharedDriverEditService.onChangeFile(this.fileArray);
      this.fileArray = [];
      this.sharedDriverEditService.onDriverUpdate(
        this.singleDriver.name,
        this.singleDriver.phone
      );
      this.modalClosed.emit(false);
    } else if (this.isFromTruck) {
      this.sharedDriverEditService.getTruckDocument(this.singleTruck);
      this.sharedDriverEditService.bindTruckValueWithForm(this.singleTruck);
      this.sharedDriverEditService.onChangeTruckFile(this.fileArray);
      this.fileArray = [];
      this.sharedDriverEditService.onTruckUpdate();
      this.modalClosed.emit(false);
    } else {
      this.fileArray = [];
    }
  }

  previewFile(file: File) {
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
      });
      this.sharedDriverEditService.closeInputSelect.next(false);
      if (!this.callFromModal) {
        this.fileInput.emit(this.fileArray);
      }
    };
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

  onDateChange($event: Event, i: number) {
    this.fileArray[i].registrationExpireDate = this.datePipe.transform(
      ($event.target as HTMLInputElement).value,
      'yyyy-MM-ddTHH:mm:ss'
    );
    if (!this.callFromModal) {
      this.fileInput.emit(this.fileArray);
    }
  }

  onCloseSelectedFile(i: number) {
    this.fileArray.splice(i, 1);
    if (!this.callFromModal) {
      this.fileInput.emit(this.fileArray);
    }
  }

  checkError(i: number) {
    return this.fileArray[i].registrationExpireDate === null;
  }
}
