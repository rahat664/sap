import { Component, inject } from '@angular/core';
import { TripService } from '../../../trip-list/services/trip.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Trip } from '../../../auth/models/response/trip';
import { ConfirmApproveComponent } from '../../../../shared/modules/confirm-approve/confirm-approve.component';
import { ConfirmRejectComponent } from '../../../../shared/modules/confirm-reject/confirm-reject.component';
import { MatDialog } from '@angular/material/dialog';
import { ChallanDashboardService } from '../../challan-dashboard.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { concatMap, of } from 'rxjs';
import { ConfirmDeleteComponent } from '../../../manage-trip/components/confirm-delete/confirm-delete.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';

@Component({
  selector: 'app-challan-details',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    NgForOf,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent,
  ],
  templateUrl: './challan-details.component.html',
  styleUrl: './challan-details.component.scss',
})
export class ChallanDetailsComponent {
  protected loadingEvents: any[] = [];
  protected unloadingEvents: any[] = [];
  readonly dialog = inject(MatDialog);
  loading: any;
  singleTrip: Trip = null;
  isInEditMode: boolean;
  addedTripDocuments: any[] = [];
  newNoteAvailableUnloading: boolean = false;
  newNoteAvailableLoading: boolean = false;
  currenDate: Date = new Date();
  loadingNote: string = '';
  unloadingNote: string = '';
  deleteUnloadingIndex: number = -1;
  deleteLoadingIndex: number = -1;

  constructor(
    private trip: TripService,
    private route: ActivatedRoute,
    private router: Router,
    private service: ChallanDashboardService,
    private datePipe: DatePipe,
    private toastr: HandleToastrService
  ) {}

  ngOnChanges(changes: any) {}

  ngOnInit() {
    this.loading = true;
    const directChallanEdit = localStorage.getItem('directEditChallan')
      ? JSON.parse(localStorage.getItem('directEditChallan'))
      : null;
    if (directChallanEdit) {
      this.isInEditMode = true;
      localStorage.removeItem('directEditChallan');
    }

    this.getSingleTripEvents();
  }

  resetSingleTripEvents() {
    this.loadingEvents = [];
    this.unloadingEvents = [];
    this.singleTrip = null;
  }

  getSingleTripEvents() {
    this.route.params.subscribe(params => {
      this.trip
        .getAllTripEvent(params['id'], 'Loading')
        .subscribe((res: any) => {
          this.loading = false;
          this.loadingEvents = res.data;
          this.loadingEvents = this.loadingEvents.filter(
            event => event.eventName === 'Upload loading challan'
          );
        });
      this.trip
        .getAllTripEvent(params['id'], 'Unloading')
        .subscribe((res: any) => {
          this.loading = false;
          this.unloadingEvents = res.data;
          this.unloadingEvents = this.unloadingEvents.filter(
            event => event.eventName === 'Upload unloading challan'
          );
        });
      this.trip.getTripDetailsByTripId(params['id']).subscribe((res: any) => {
        this.singleTrip = res.data;
      });
    });
  }

  getLoadingPoint(tripPoints: any) {
    if (tripPoints) {
      return tripPoints.filter(point => point.pointType === 'Loading');
    } else {
      return [];
    }
  }

  getUnloadingPoint(tripPoints: any) {
    if (tripPoints) {
      return tripPoints.filter(point => point.pointType === 'Unloading');
    } else {
      return [];
    }
  }

  getDueDays(singleTrip: Trip) {
    const tripCompletedDate = new Date(singleTrip?.tripEndedAt);
    if (singleTrip?.challanStatusUpdatedAt) {
      const challanStatusUpdatedDate = new Date(
        singleTrip?.challanStatusUpdatedAt
      );
      return this.datePipe.transform(
        challanStatusUpdatedDate,
        'dd MMM,yyyy h:mm a'
      );
    } else {
      // return due days from trip end date
      const currentDate = new Date();
      const diffTime = Math.abs(
        currentDate.getTime() - tripCompletedDate.getTime()
      );
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  }

  getFirstSixDocuments(tripDocuments: any) {
    if (tripDocuments) {
      return tripDocuments.slice(0, 6);
    } else {
      return [];
    }
  }

  onSave() {
    const requests = [];

    if (this.loadingNote) {
      const loadingRequest = {
        tripPointNo: this.singleTrip.tripId,
        tripPointEventTypeId: this.loadingEvents[0].eventTypeId,
        dateTime: this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss'),
        type: 'Loading',
        note: this.loadingNote,
      };
      const formData = new FormData();
      formData.append(
        'request',
        new Blob([JSON.stringify(loadingRequest)], { type: 'application/json' })
      );
      requests.push(this.trip.manageLoadingUnloading(formData));
    }

    if (this.unloadingNote) {
      const unloadingRequest = {
        tripPointNo: this.singleTrip.tripId,
        tripPointEventTypeId: this.unloadingEvents[0].eventTypeId,
        dateTime: this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss'),
        type: 'Unloading',
        note: this.unloadingNote,
      };
      const formData2 = new FormData();
      formData2.append(
        'request',
        new Blob([JSON.stringify(unloadingRequest)], {
          type: 'application/json',
        })
      );
      requests.push(this.trip.manageLoadingUnloading(formData2));
    }

    of(...requests)
      .pipe(concatMap(request => request))
      .subscribe(() => {
        this.loadingNote = '';
        this.unloadingNote = '';
        this.newNoteAvailableLoading = false;
        this.newNoteAvailableUnloading = false;
        this.resetSingleTripEvents();
        this.getSingleTripEvents();
      });
  }

  onCancel() {
    this.isInEditMode = false;
    this.newNoteAvailableUnloading = false;
    this.newNoteAvailableLoading = false;
    this.loadingNote = '';
    this.unloadingNote = '';
  }

  onEdit() {
    this.isInEditMode = true;
  }

  onReject() {}

  onDoubleClick(tripDocuments: any, document: any) {
    this.router.navigate(['image-details'], {
      state: {
        tripDocuments: tripDocuments,
        imageType: 'Unloading Challan',
        expiryAvailable: false,
        noteAvailable: false,
        activatedDocument: document,
        tripPointId: this.unloadingEvents[0].tripPointId,
        eventTypeId: this.unloadingEvents[0].eventTypeId,
        returnUrl: `/challan-management/${this.singleTrip?.tripId}/details`,
        tripId: this.singleTrip?.tripId,
      },
    });
  }

  onDoubleClickLoading(tripDocuments: any, document: any) {
    this.router.navigate(['image-details'], {
      state: {
        tripDocuments: tripDocuments,
        imageType: 'Loading Challan',
        expiryAvailable: false,
        noteAvailable: false,
        activatedDocument: document,
        tripPointId: this.loadingEvents[0].tripPointId,
        eventTypeId: this.loadingEvents[0].eventTypeId,
        returnUrl: `/challan-management/${this.singleTrip?.tripId}/details`,
      },
    });
  }

  onLoadingFileChange($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.router.navigate(
        [`challan-management/${this.singleTrip?.tripId}/image-upload`],
        {
          state: {
            tripId: this.singleTrip?.tripId,
            addedTripDocument: files,
            imageType: [{ value: '1', viewValue: 'Loading Challan' }],
            expiryAvailable: false,
            noteAvailable: true,
            eventTypeId: this.loadingEvents[0].eventTypeId,
            tripPointId: this.loadingEvents[0].tripPointId,
            type: 'Loading',
            returnUrl: `/challan-management/${this.singleTrip?.tripId}/details`,
          },
        }
      );
    }
  }

  onUnloadingFileChange($event: Event) {
    const input = $event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.router.navigate(
        [`challan-management/${this.singleTrip?.tripId}/image-upload`],
        {
          state: {
            tripId: this.singleTrip?.tripId,
            addedTripDocument: files,
            imageType: [{ value: '1', viewValue: 'Unloading Challan' }],
            expiryAvailable: false,
            noteAvailable: true,
            eventTypeId: this.unloadingEvents[0].eventTypeId,
            tripPointId: this.unloadingEvents[0].tripPointId,
            type: 'Unloading',
            returnUrl: `/challan-management/${this.singleTrip?.tripId}/details`,
          },
        }
      );
    }
  }

  changeStatus(id, name, status: string) {
    const body = {
      challanStatus: status,
    };
    if (status === 'Approved') {
      this.dialog
        .open(ConfirmApproveComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the challan for trip ID ',
            text: `${name}?`,
            buttonText: 'Approve',
          },
        })
        .afterClosed()
        .subscribe(res => {
          if (res) {
            this.service.updateChallanStatus(id, body).subscribe((res: any) => {
              this.toastr.showSuccess('Challan approved successfully');
              this.router.navigate(['/challan-management']);
            });
          }
        });
    } else {
      this.dialog
        .open(ConfirmRejectComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the challan for trip ID ',
            text: `${name}?`,
            buttonText: 'Reject',
            reasonAvailable: false,
          },
        })
        .afterClosed()
        .subscribe(res => {
          if (res) {
            this.service.updateChallanStatus(id, body).subscribe((res: any) => {
              this.toastr.showSuccess('Challan rejected successfully');
              this.router.navigate(['/challan-management']);
            });
          }
        });
    }
  }

  onClickAddNoteLoading() {
    this.newNoteAvailableLoading = true;
  }

  onClickAddNoteUnloading() {
    this.newNoteAvailableUnloading = true;
  }

  onMouseEnterUnloading(i: number) {
    this.deleteUnloadingIndex = i;
  }

  onMouseEnterLoading(i: number) {
    this.deleteLoadingIndex = i;
  }

  onMouseLeaveUnLoading() {
    this.deleteUnloadingIndex = -1;
  }

  onMouseLeaveLoading() {
    this.deleteLoadingIndex = -1;
  }

  onDeleteUnloadingDocuments(document: any) {
    this.dialog
      .open(ConfirmDeleteComponent, {
        data: {
          title: 'Attention',
          text: 'Are you sure you want to delete this document?',
          buttonText: 'Delete',
        },
      })
      .afterClosed()
      .subscribe(res => {
        if (res === 'deleted') {
          this.trip
            .deleteTripDocument(
              this.unloadingEvents[0].tripPointId,
              this.unloadingEvents[0].eventTypeId,
              document.id
            )
            .subscribe(() => {
              this.resetSingleTripEvents();
              this.getSingleTripEvents();
            });
        }
      });
  }

  onDeleteLoadingDocuments(document: any) {
    this.dialog
      .open(ConfirmDeleteComponent, {
        data: {
          title: 'Attention',
          text: 'Are you sure you want to delete this document?',
          buttonText: 'Delete',
        },
      })
      .afterClosed()
      .subscribe(res => {
        if (res === 'deleted') {
          this.trip
            .deleteTripDocument(
              this.loadingEvents[0].tripPointId,
              this.loadingEvents[0].eventTypeId,
              document.id
            )
            .subscribe(() => {
              this.toastr.showSuccess('Document deleted successfully');
              this.resetSingleTripEvents();
              this.getSingleTripEvents();
            });
        }
      });
  }

  getTimeByChallanStatus(challanStatus: string | undefined) {
    switch (challanStatus) {
      case 'Approved':
        return 'Approval Time';
      case 'Rejected':
        return 'Rejection Time';
      case 'Received':
        return 'Receiving Time';
      default:
        return 'Receiving Time';
    }
  }
}
