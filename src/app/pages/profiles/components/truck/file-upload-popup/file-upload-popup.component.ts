import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  OnChanges, ChangeDetectorRef, SimpleChanges,
} from '@angular/core';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { fileUpload } from '../models/file-upload';
import { CommonModule } from '@angular/common';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';

@Component({
  selector: 'app-file-upload-popup',
  standalone: true,
  imports: [CustomInputComponent, GetClickEventDirective, CommonModule],
  templateUrl: './file-upload-popup.component.html',
  styleUrl: './file-upload-popup.component.scss',
})
export class FileUploadPopupComponent implements OnChanges {
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

  constructor(private sharedDriverEditService: DriverEditSharedService,
              private cdr: ChangeDetectorRef) {
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
      option => option.id === $event,
    ).value;
    this.fileArray[i].registrationType = this.fileInputPlaceholder;
    if (!this.callFromModal) {
      this.fileInput.emit(this.fileArray);
    }
    this.fileArray[i].fileOpened = false;
  }

  onClickFileType($event: boolean, i: number) {
    this.fileArray[i].fileOpened = $event;
    this.fileArray.forEach((file, index) => {
      this.fileTypeOptions.forEach(option => {
        if (file.registrationType === option.value) {
          // remove the selected file type from the dropdown
          this.fileTypeOptions.splice(this.fileTypeOptions.indexOf(option), 1);
        }
      });
    });
  }

  @Output() modalClosed: EventEmitter<any> = new EventEmitter<any>();

  onSubmit() {
    this.sharedDriverEditService.isUploadPopupOpen.next(false);
    this.fileInput.emit(this.fileArray);
    if (this.isFromDriver) {
      this.sharedDriverEditService.getDocument(this.singleDriver);
      this.sharedDriverEditService.bindDriverValueWithForm(this.singleDriver);
      this.sharedDriverEditService.onChangeFile(this.fileArray);
      this.sharedDriverEditService.onDriverUpdate(
        this.singleDriver.name,
        this.singleDriver.phone,
      );
      this.modalClosed.emit(false);
    } else if (this.isFromTruck) {
      this.sharedDriverEditService.getTruckDocument(this.singleTruck);
      this.sharedDriverEditService.bindTruckValueWithForm(this.singleTruck);
      this.sharedDriverEditService.onChangeTruckFile(this.fileArray);
      this.sharedDriverEditService.onTruckUpdate();
      this.modalClosed.emit(false);
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
      });
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
    this.fileArray[i].registrationExpireDate = (
      $event.target as HTMLInputElement
    ).value;
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
}
