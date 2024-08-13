import { Component, inject, TemplateRef } from '@angular/core';
import { CreatePopupComponent } from '../../../../shared/modal/create-popup/create-popup.component';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FileUploadPopupComponent } from '../truck/file-upload-popup/file-upload-popup.component';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { RouterLink } from '@angular/router';
import { UploadButtonComponent } from '../../../../shared/modules/upload-button/upload-button.component';
import { VehicleTracker } from '../driver/models/tracker.model';
import { TrackerService } from '../../services/tracker.service';
import { TruckService } from '../truck/services/truck.service';
import { MatDialog } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TruckModel } from '../truck/models/truck.model';
import { TruckInnerModel } from '../truck/models/truck-inner.model';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    CreatePopupComponent,
    DatePipe,
    FileUploadPopupComponent,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    LoadingComponent,
    NgForOf,
    NgIf,
    RouterLink,
    UploadButtonComponent,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    ReactiveFormsModule,
  ],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss',
})
export class TrackerComponent {
  readonly dialog = inject(MatDialog);

  loading: boolean;
  trackerList: VehicleTracker[];
  totalPages: number;
  height: string;
  page: number = 0;
  size: number = 20;
  searchValue: string;
  trackerUpdateForm: FormGroup;
  truckSuggestion: TruckInnerModel[] = [];
  private selectedTrackerId: number;

  constructor(
    private service: TrackerService,
    private truck: TruckService,
    private fb: FormBuilder,
    private toast: HandleToastrService
  ) {
    this.trackerUpdateForm = this.fb.group({
      truckRegNo: [''],
    });
  }

  ngOnInit() {
    this.getTrackers();
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.getTrackers();
    }
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.page = 0;
    this.searchValue = ($event.target as HTMLInputElement).value;
    this.getTrackers();
  }

  private getTrackers() {
    this.loading = true;
    this.service
      .getTrackers(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        if (this.page === 0) {
          this.trackerList = res.data.content;
        } else {
          this.trackerList.push(...res.data.content);
        }
        this.loading = false;
        this.totalPages = res.data.totalPages;
      });
  }

  onClickUpdate(tracker: number | undefined, popup: TemplateRef<any>) {
    this.selectedTrackerId = tracker;
    this.dialog.open(popup, {
      width: '25rem',
      minHeight: '12rem',
    });
  }

  onKeyUpTruckSearch($event: any) {
    const value = $event.target.value;
    if (value.length > 0) {
      this.truckSuggestion = [];
      this.truck.getTruckList(0, 500, value).subscribe((res: any) => {
        res.data.responses.forEach((truck: TruckModel) => {
          this.truckSuggestion.push(truck.truck);
        });
      });
    } else {
      this.truckSuggestion = [];
    }
  }

  onClickTruckSearchSuggestion(option: TruckInnerModel) {
    this.trackerUpdateForm
      .get('truckRegNo')
      .setValue(option.fullRegistrationNumber);
    this.truckSuggestion = [];
  }

  onClickAssignTruck() {
    if (this.trackerUpdateForm.valid) {
      const body = {
        vehicleRegistrationNumber:
          this.trackerUpdateForm.get('truckRegNo').value,
      };
      this.service.updateTracker(this.selectedTrackerId, body).subscribe(
        (res: any) => {
          if (res.status == 'OK') {
            this.page = 0;
            this.getTrackers();
            this.dialog.closeAll();
            this.toast.showSuccess('Tracker updated successfully');
          } else {
            this.toast.showError('Failed to update tracker');
          }
        },
        err => {
          this.toast.showError('Failed to update tracker');
        }
      );
    }
  }
}
