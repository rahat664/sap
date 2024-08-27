import {
  ChangeDetectionStrategy,
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
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { CommonModule, DatePipe } from '@angular/common';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatCalendar,
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-upload-popup',
  standalone: true,
  imports: [
    CustomInputComponent,
    GetClickEventDirective,
    CommonModule,
    MatCalendar,
    MatFormField,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatInput,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './file-upload-popup.component.html',
  styleUrl: './file-upload-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadPopupComponent implements OnChanges {
  readonly dialogRef = inject(MatDialogRef<FileUploadPopupComponent>);
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
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
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
    this.fileInputPlaceholder = this.data.filetype.find(
      (option: { id: number }) => option.id === $event
    ).value;
    this.fileArray[i].registrationType = this.fileInputPlaceholder;
    if (!this.callFromModal) {
      this.fileInput.emit(this.fileArray);
    }
    this.fileArray[i].fileOpened = false;
    const registrationTypesSet: Set<any> = new Set(
      this.fileArray.map(file => file.registrationType)
    );

    // Filter the fileTypeOptions based on the registrationTypesSet
    this.newFileType = this.data.filetype.filter(
      (filetype: { value: any }) => !registrationTypesSet.has(filetype.value)
    );

    // Assign the filtered options to each file's registrationOptions
    this.fileArray[i].registrationOptions = this.newFileType;
  }

  @Output() modalClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() isUploadDisabled: boolean = false;

  onSubmit() {
    this.sharedDriverEditService.isUploadPopupOpen.next(false);
    this.fileInput.emit(this.fileArray);
    if (this.data?.from == 'driver') {
      this.sharedDriverEditService.getDocument(this.data?.value);
      this.sharedDriverEditService.bindDriverValueWithForm(this.data?.value);
      this.sharedDriverEditService.onChangeFile(this.fileArray);
      this.fileArray = [];
      this.sharedDriverEditService.onDriverUpdate(
        this.singleDriver.name,
        this.singleDriver.phone
      );
      this.modalClosed.emit(false);
    } else if (this.data?.from == 'truck') {
      this.sharedDriverEditService.getTruckDocument(this.data?.value);
      this.sharedDriverEditService.bindTruckValueWithForm(this.data?.value);
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
      this.fileInput.emit(this.fileArray);
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
      'yyyy-MM-ddThh:mm:ss'
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

  onClose() {
    this.dialogRef.close();
  }
}
