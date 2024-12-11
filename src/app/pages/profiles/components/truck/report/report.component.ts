import { Component, inject } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { statusButtons } from '../../../../trip-list/models/status-buttons';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { DateEnum } from '../../../../trip-list/Enum/date.enum';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { LoadingComponent } from '../../../../../shared/modules/loading/loading.component';
import { VehicleTracker } from '../../driver/models/tracker.model';
import { GiveMaxHeightDirective } from '../../../../../shared/directive/give-max-height.directive';
import { TrackerService } from '../../../services/tracker.service';
import { HandleToastrService } from '../../../../../shared/services/handle-toastr/handle-toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ReportDownloadPopupComponent } from './report-download-popup/report-download-popup.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    NgForOf,
    MatCheckbox,
    NgIf,
    NgSelectModule,
    FormsModule,
    CustomInputComponent,
    GetClickEventDirective,
    LoadingComponent,
    GiveMaxHeightDirective,
    MatTooltip,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  readonly dialog = inject(MatDialog);
  protected readonly statusButtons = statusButtons;
  height: any;
  dateOpened: boolean;
  inputPlaceholder: string;
  dateOptionArray: CustomInputSelectModel[] = [];
  protected fromDate: string;
  protected toDate: string;
  loading: any;
  truckList: VehicleTracker[] = [];
  selectedTruckList: number[] = [];
  selectedTruckName: string[] = [];
  partiallyChecked: boolean;
  isCustomOpened: boolean = false;

  constructor(
    private datePipe: DatePipe,
    private shared: DriverEditSharedService,
    private service: TrackerService,
    private toaster: HandleToastrService
  ) {}

  onSelectedFromDate($event: string) {
    if ($event) {
      this.fromDate = $event;
    }
  }

  onSelectedToDate($event: string) {
    if ($event) {
      this.toDate = $event;
    }
  }

  ngOnInit() {
    this.getTrackerList();
    this.getDateOptionArray();
  }

  onSelectDate($event: number) {
    if ($event === DateEnum.Custom) {
      this.shared.closeInputSelect.next(false);
      this.isCustomOpened = true;
    } else {
      this.shared.closeInputSelect.next(true);
      this.inputPlaceholder =
        this.dateOptionArray.find(x => x.id === $event)?.value || '';
      this.dateOptionArray.forEach(x => (x.selected = x.id === $event));
      this.setDateRange($event);
    }
  }

  private setDateRange(dateEnum: DateEnum) {
    let fromDate = new Date();
    // to date should be yesterday
    let toDate = new Date();
    switch (dateEnum) {
      case DateEnum.Yesterday:
        this.isCustomOpened = false;
        fromDate.setDate(fromDate.getDate() - 1);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.LastSevenDays:
        this.isCustomOpened = false;
        // shouldn't be count today
        fromDate.setDate(fromDate.getDate() - 7);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.LastFifteenDays:
        this.isCustomOpened = false;
        fromDate.setDate(fromDate.getDate() - 15);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.LastThirtyDays:
        this.isCustomOpened = false;
        fromDate.setDate(fromDate.getDate() - 30);
        toDate.setDate(toDate.getDate() - 1);
        break;
      case DateEnum.Custom:
        this.isCustomOpened = true;
        break;
      default:
        this.isCustomOpened = true;
        break;
    }
    this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd') || '';
    this.toDate = this.datePipe.transform(toDate, 'yyyy-MM-dd') || '';
  }

  getDateOptionArray() {
    this.dateOptionArray = [
      {
        id: DateEnum.Yesterday,
        value: 'Yesterday',
        selected: false,
      },
      {
        id: DateEnum.LastSevenDays,
        value: 'Last 7 Days',
        selected: false,
      },
      {
        id: DateEnum.LastFifteenDays,
        value: 'Last 15 Days',
        selected: false,
      },
      {
        id: DateEnum.LastThirtyDays,
        value: 'Last 30 Days',
        selected: false,
      },
    ];
  }

  private getTrackerList() {
    this.loading = true;
    this.service.getTrackers(0, 100).subscribe((res: any) => {
      this.loading = false;
      this.truckList = res.data.content;
    });
  }

  selectAllTruck($any: any) {
    if ($any.checked) {
      this.truckList.forEach(x => {
        if (x.vehicleRegistrationNumber) {
          this.selectedTruckList.push(x.vehicleId);
          this.selectedTruckName.push(x.vehicleRegistrationNumber);
          x.checked = true;
        }
      });
    } else {
      this.truckList.forEach(x => (x.checked = false));
      this.selectedTruckList = [];
      this.selectedTruckName = [];
    }
  }

  selectSingleTruck($any: any, truck: VehicleTracker) {
    if ($any.checked) {
      this.selectedTruckList.push(truck.vehicleId);
      this.selectedTruckName.push(truck.vehicleRegistrationNumber);
      truck.checked = true;
    } else {
      const index = this.selectedTruckList.indexOf(truck.vehicleId);
      if (index > -1) {
        this.selectedTruckList.splice(index, 1);
        this.selectedTruckName.splice(index, 1);
      }
      truck.checked = false;
    }
  }

  checkThatAllIsCheckedOrNot() {
    const truckListWhichHasName = this.truckList.filter(
      x => x.vehicleRegistrationNumber
    );
    if (this.selectedTruckList.length === truckListWhichHasName.length) {
      this.partiallyChecked = false;
      return true;
    } else if (
      this.selectedTruckList.length < truckListWhichHasName.length &&
      this.selectedTruckList.length > 0
    ) {
      this.partiallyChecked = true;
      return false;
    } else {
      this.partiallyChecked = false;
      return false;
    }
  }

  onClickGenerateReport() {
    let message = '';
    if (this.selectedTruckList.length === 0) {
      message += 'truck';
    }
    if (!this.fromDate) {
      if (message) message += ' & ';
      message += 'from date';
    }
    if (!this.toDate) {
      if (message) message += ' & ';
      message += 'to date';
    } else {
      this.dialog
        .open(ReportDownloadPopupComponent, {
          minWidth: '50vw',
          maxHeight: '80vh',
          maxWidth: '50vw',
          minHeight: '60vh',
          data: {
            // heading will selected date and time range
            heading: `Generated report from ${this.datePipe.transform(
              this.fromDate,
              'd MMM,yyyy'
            )} to ${this.datePipe.transform(this.toDate, 'd MMM,yyyy')}`,
          },
        })
        .afterClosed()
        .subscribe((res: any) => {
          if (res === 'download') {
            this.service
              .downReport(
                this.formateFromData(this.fromDate),
                this.formateToData(this.toDate),
                this.selectedTruckList.join(',')
              )
              .subscribe(
                (res: any) => {
                  const url = window.URL.createObjectURL(res);
                  const a = document.createElement('a');
                  document.body.appendChild(a);
                  a.style.display = 'none';
                  a.href = url;
                  // download link with formated timestamp
                  a.download = `${this.selectedTruckName.join('_')}_${this.datePipe.transform(
                    new Date(),
                    'yyyy-MM-dd_HH-mm-ss'
                  )}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                },
                error => {
                  this.toaster.showError('Failed to download report');
                }
              );
          }
        });
    }

    if (message) {
      this.toaster.showError(`Please select ${message}`);
    }
  }

  private formateFromData(fromDate: string) {
    // return from date with datetime format 00:00
    return this.datePipe.transform(fromDate, 'yyyy-MM-dd') + ' 00:00';
  }

  private formateToData(toDate: string) {
    // return next day from today with datetime format 00:00
    const date = new Date(toDate);
    date.setDate(date.getDate() + 1);
    return this.datePipe.transform(date, 'yyyy-MM-dd') + ' 00:00';
  }
}
