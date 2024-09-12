import { Component } from '@angular/core';
import { AlphabetOnlyDirective } from '../../../../../shared/directive/alphabet-only.directive';
import { FileUploadPopupComponent } from '../../truck/file-upload-popup/file-upload-popup.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TrackerService } from '../../../services/tracker.service';
import { VendorModel } from '../../driver/models/vendor.model';
import { MatInput } from '@angular/material/input';
import { TrackerRequestModel } from '../../driver/models/tracker-request.model';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { Router } from '@angular/router';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { TruckService } from '../../truck/services/truck.service';
import { TruckModel } from '../../truck/models/truck.model';
import { TruckInnerModel } from '../../truck/models/truck-inner.model';

@Component({
  selector: 'app-add-tracker',
  standalone: true,
  imports: [
    AlphabetOnlyDirective,
    FileUploadPopupComponent,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    MatFormField,
    MatOption,
    MatSelect,
    MatInput,
    MatAutocomplete,
    MatAutocompleteTrigger,
  ],
  templateUrl: './add-tracker.component.html',
  styleUrl: './add-tracker.component.scss',
})
export class AddTrackerComponent {
  trackerAddForm: FormGroup;
  vendorList: VendorModel[] = [];
  trackAddModel: TrackerRequestModel = new TrackerRequestModel();
  truckSuggestion: TruckInnerModel[] = [];

  constructor(
    private service: TrackerService,
    private fb: FormBuilder,
    private toast: HandleToastrService,
    private router: Router,
    private truck: TruckService
  ) {
    this.trackerAddForm = this.fb.group({
      vendorId: [''],
      trackerType: [''],
      username: [''],
      password: [''],
      trackerId: [''],
      truckRegNo: [''],
    });
  }

  onTrackerSave() {
    if (this.trackerAddForm.valid) {
      this.trackAddModel.vendorId = this.trackerAddForm.get('vendorId').value;
      this.trackAddModel.trackerType =
        this.trackerAddForm.get('trackerType').value;
      this.trackAddModel.username = this.trackerAddForm.get('username').value;
      this.trackAddModel.password = this.trackerAddForm.get('password').value;
      this.trackAddModel.trackerId = this.trackerAddForm.get('trackerId').value;
      this.trackAddModel.vehicleRegistrationNumber =
        this.trackerAddForm.get('truckRegNo').value;
      this.service.addTracker(this.trackAddModel).subscribe(
        (res: any) => {
          if (res.status == 'OK') {
            this.router.navigate(['/profile/tracker']);
            this.toast.showSuccess('Tracker added successfully');
            this.trackerAddForm.reset();
          } else {
            this.toast.showError('Failed to add tracker');
          }
        },
        err => {
          this.toast.showError('Failed to add tracker');
        }
      );
    }
  }

  ngOnInit() {
    this.getAllVendors();
  }

  onChangeVendorType($event: any) {}

  private getAllVendors() {
    this.service.getVendors().subscribe((res: any) => {
      this.vendorList = res.data;
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
    this.trackerAddForm
      .get('truckRegNo')
      .setValue(option.fullRegistrationNumber);
    this.truckSuggestion = [];
  }
}
