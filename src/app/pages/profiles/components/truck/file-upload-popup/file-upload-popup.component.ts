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
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { CommonModule, DatePipe } from '@angular/common';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatCalendar,
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';

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
    MatDateRangeInput,
    MatDateRangePicker,
    MatSuffix,
    MatButton,
    MatMenuTrigger,
    MatMenu,
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
      if (this.data?.from == 'driver') {
        const isExpiryFilled = this.fileArray.every(
          (file) => file.registrationExpireDate !== null
        );
        if (isExpiryFilled) {
          this.dialogRef.close(this.fileArray);
          this.fileInput.emit(this.fileArray);
          this.sharedDriverEditService.isUploadPopupOpen.next(false);
          this.sharedDriverEditService.getDocument(this.data?.value);
          this.sharedDriverEditService.bindDriverValueWithForm(this.data?.value);
          this.sharedDriverEditService.onChangeFile(this.fileArray);
          this.fileArray = [];
          this.sharedDriverEditService.onDriverUpdate(
            this.data?.value?.name,
            this.data?.value?.phone
          );
        } else {
          this.sharedDriverEditService.isUploadPopupOpen.next(true);
          this.toastr.showError('Please fill the expiry date of all files');
        }
      } else if (this.data?.from == 'truck') {
        const isExpiryFilled = this.fileArray.every(
          (file) => file.registrationExpireDate !== null
        );
        if (isExpiryFilled) {
          this.dialogRef.close(this.fileArray);
          this.fileInput.emit(this.fileArray);
          this.sharedDriverEditService.isUploadPopupOpen.next(false);
          this.sharedDriverEditService.getTruckDocument(this.data?.value);
          this.sharedDriverEditService.bindTruckValueWithForm(this.data?.value);
          this.sharedDriverEditService.onChangeTruckFile(this.fileArray);
          this.fileArray = [];
          this.sharedDriverEditService.onTruckUpdate();
        } else {
          this.sharedDriverEditService.isUploadPopupOpen.next(true);
          this.toastr.showError('Please fill the expiry date of all files');
        }
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

  selectedDate: any = new Date();

  onDateChange($event: any, i: number) {
    this.selectedDate = $event.target.value;
    this.fileArray[i].registrationExpireDate = this.datePipe.transform(
      this.selectedDate,
      'yyyy-MM-ddThh:mm:ss'
    );
  }

  onCloseSelectedFile(i: number) {
    this.fileArray.splice(i, 1);
    this.fileInput.emit(this.fileArray);
  }

  onClose() {
    this.dialogRef.close('close');
  }
}
