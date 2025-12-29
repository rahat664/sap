import { isSuccessStatus } from '../../../../../shared/utils/response-status';
import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VendorModel } from '../../driver/models/vendor.model';
import { TrackerRequestModel } from '../../driver/models/tracker-request.model';
import { TruckModel } from '../../truck/models/truck.model';
import { TrackerService } from '../../../services/tracker.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { Router } from '@angular/router';
import { TruckService } from '../../truck/services/truck.service';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { VehicleTracker } from '../../driver/models/tracker.model';

@Component({
  selector: 'app-edit-tracker',
  imports: [
    MatAutocomplete,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatInput,
    MatFormField,
    MatOption,
    MatSelect,
  ],
  templateUrl: './edit-tracker.component.html',
  styleUrl: './edit-tracker.component.scss',
})
export class EditTrackerComponent implements OnInit, AfterViewInit {
  @ViewChild('disableSelect') disableSelect: any;
  @ViewChild('disableVendorSelect') disableVendorSelect: any;
  trackerAddForm: FormGroup;
  vendorList: VendorModel[] = [];
  trackAddModel: TrackerRequestModel = new TrackerRequestModel();
  truckSuggestion: TruckModel[] = [];
  private singleTrackerDetails: VehicleTracker = null;
  isDisabled = true;

  constructor(
    private service: TrackerService,
    private fb: FormBuilder,
    private toast: HandleToastrService,
    private router: Router,
    private truck: TruckService,
    private cd: ChangeDetectorRef
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
      this.trackAddModel.vehicleRegistrationNumber =
        this.trackerAddForm.get('truckRegNo').value;
      this.service
        .updateTracker(this.singleTrackerDetails?.id, this.trackAddModel)
        .subscribe(
          (res: any) => {
            if (isSuccessStatus(res?.status)) {
              this.router.navigate(['/profile/tracker']);
              this.toast.showSuccess(res.message);
              this.trackerAddForm.reset();
            } else {
              this.toast.showError(res.message);
            }
          },
          err => {
            this.toast.showError(err.message);
          }
        );
    }
  }

  ngOnInit() {
    this.getAllVendors();
    this.clearNavigationState();
    this.getNavigationState();
    this.disableSelect._elementRef.nativeElement.style.pointerEvents = 'none';
    this.disableVendorSelect._elementRef.nativeElement.style.pointerEvents =
      'none';
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
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
          this.truckSuggestion.push(truck);
        });
      });
    } else {
      this.truckSuggestion = [];
    }
  }

  onClickTruckSearchSuggestion(option: TruckModel) {
    this.trackerAddForm
      .get('truckRegNo')
      .setValue(option.fullRegistrationNumber);
    this.truckSuggestion = [];
  }

  private clearNavigationState() {
    this.singleTrackerDetails = null;
  }

  private getNavigationState() {
    this.singleTrackerDetails = history.state.tracker;
    if (this.singleTrackerDetails) {
      this.trackerAddForm.patchValue({
        truckRegNo: this.singleTrackerDetails.vehicleRegistrationNumber,
        vendorId: this.singleTrackerDetails.vendor.id,
        trackerType: this.singleTrackerDetails.trackerType,
        trackerId: this.singleTrackerDetails.trackerId,
      });
    }
  }
}
