import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { statusButtons } from '../../../../trip-list/models/status-buttons';
import { ButtonChipsComponent } from '../../../../trip-list/modules/button-chips/button-chips.component';
import { CustomInputComponent } from '../../../../../shared/modules/custom-input/custom-input.component';
import { GetClickEventDirective } from '../../../../../shared/directive/get-click-event.directive';
import { GetElementHeightDirective } from '../../../../../shared/directive/get-element-height.directive';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ScrollByButtonDirective } from '../../../../../shared/directive/scroll-by-button.directive';
import { CustomInputSelectModel } from '../../../../../shared/modules/custom-input/custom-input-select.model';
import { DateEnum } from '../../../../trip-list/Enum/date.enum';
import { DriverEditSharedService } from '../../../services/driver-edit-shared.service';
import { LoadingComponent } from '../../../../../shared/modules/loading/loading.component';
import { VehicleTracker } from '../../driver/models/tracker.model';
import { RouterLink } from '@angular/router';
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
    DatePipe,
    NgClass,
    ButtonChipsComponent,
    CustomInputComponent,
    DecimalPipe,
    GetClickEventDirective,
    GetElementHeightDirective,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    ScrollByButtonDirective,
    LoadingComponent,
    RouterLink,
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
    console.log($event);
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
          minWidth: '30vw',
          maxHeight: '80vh',
          maxWidth: '50vw',
          minHeight: '60vh',
          data: {
            heading: `${this.selectedTruckName.join('_')}`,
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
                  a.download = `Report_${this.fromDate}_${this.toDate}_${this.selectedTruckName}.pdf`;
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
    // return to date with datetime format 23:59
    return this.datePipe.transform(toDate, 'yyyy-MM-dd') + ' 23:59';
  }
}
