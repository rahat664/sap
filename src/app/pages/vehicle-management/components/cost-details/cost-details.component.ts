import { Component } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetElementHeightDirective } from '../../../../shared/directive/get-element-height.directive';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../../../shared/modules/loading/loading.component';
import { MatDatepickerModule, MatDatepickerToggle, MatDateRangeInput, MatDateRangePicker } from '@angular/material/datepicker';
import { MatSuffix } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { StatisticsDetail, StatisticsSummary } from '../../../profiles/components/truck/models/vehicles-statics.model';
import { Router } from '@angular/router';
import { truckFileType } from '../../../profiles/components/truck/models/truck-file-type';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { DailyExpense, ExpenseItem, ExpenseModel } from '../../../profiles/components/truck/models/truck.model';

@Component({
  selector: 'app-cost-details',
  imports: [
    CardComponent,
    DatePipe,
    DecimalPipe,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    LoadingComponent,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatDatepickerModule,
    FormsModule,
    MatFormField,
    MatSuffix,
    NgForOf,
    NgIf,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './cost-details.component.html',
  styleUrl: './cost-details.component.scss',
})
export class CostDetailsComponent {
  protected readonly truckFileType = truckFileType;
  totalPages: number = 0;
  statisticsDetails: StatisticsDetail[] = [];
  loading: any;
  height: string;
  vehicleExpenses: ExpenseModel[] = [];
  expenseList: DailyExpense[] = [];
  startDate: string;
  endDate: string;
  vehicleId: string;
  // Date range quick selection (align with Manage Trip)
  buttonName: any[] = ['Today', 'Last 7 Days', 'Last 15 Days', 'Last 30 Days', 'Custom'];
  selectedButton: any;
  dateSelected: boolean;
  dateText: string;
  customDateText: string;
  customSelected: boolean = true;

  constructor(private router: Router, private service: TruckService, private datePipe: DatePipe) {}

  onBottom($event: boolean) {}

  onClickTruckDetails(truck: any) {}
  calculateTotalExpenses() {
    return this.vehicleExpenses.reduce(
      (total, expense) => total + expense.totalCostSum,
      0
    );
  }

  getHeight() {
    const heightInNumber = Number(this.height.replace('px', ''));
    return heightInNumber + 40 + 'px';
  }

  goBack() {
    window.history.back();
  }

  ngOnInit() {
    const vehicleId = localStorage.getItem('vehicleId');
    this.vehicleId = vehicleId || '';
    this.getCostDetails(this.vehicleId);
    this.getVehicleExpenses(this.vehicleId);
  }

  goToTripDetails(tripId: string) {
    localStorage.setItem('fromTripListTripId', tripId);
    this.router.navigateByUrl('/manage-trip');
  }

  updateOverLayStyle(isSpecial: boolean) {
    const className = 'custom-overlay-bounding-box';
    if (isSpecial) document.body.classList.add(className);
    else document.body.classList.remove(className);
  }

  private getCostDetails(s: string, from?: string, to?: string) {
    const body = {
      vehicleId: [s],
    };
    const meta = {
      page: 0,
      limit: 10,
      sort: [
        {
          field: 'id',
          order: 'desc',
        },
      ]
    }
    const datePipeFrom = from ? this.datePipe.transform(new Date(from), 'yyyy-MM-ddThh:mm:ss') : null;
    const datePipeTo = to ? this.datePipe.transform(new Date(to), 'yyyy-MM-ddThh:mm:ss') : null;
    this.service.getExpenseListByDate(
      s,
      datePipeFrom,
      datePipeTo,
    ).subscribe(
      (res: any) => {
        console.log(res);
        if (res && res.data) {
          // Do something with the cost details
          this.expenseList = res.data;
        } else {
          // Handle the case where data is not available
        }
      },
      err => {
        console.error('Error fetching cost details', err);
      }
    )
  }

  private getVehicleExpenses(vehicleId: string) {
    this.service.getExpenses(vehicleId).subscribe(
      (res: any) => {
        if (res && res.data) {
          // Do something with the vehicle statistics
          this.vehicleExpenses = res.data;
        } else {
          // Handle the case where data is not available
        }
      },
      error => {
        // Handle error (e.g., show a notification)
      }
    );
  }

  checkIsThisCostTypeAbsent(list: ExpenseItem[], type: string) {
    return !list.some(item => item.type.toLowerCase().includes(type.toLowerCase()));
  }

  onChangeStartDate($event: any) {
    const raw = $event?.value ?? $event?.target?.value ?? '';
    if (!raw) {
      this.startDate = '';
      return;
    }
    const dateVal = raw instanceof Date ? raw : new Date(raw);
    this.startDate = this.datePipe.transform(dateVal, 'yyyy-MM-dd');
  }

  onChangeEndDate($event: any) {
    const raw = $event?.value ?? $event?.target?.value ?? '';
    if (!raw) {
      this.endDate = '';
      // If both dates cleared, reload without filter
      if (!this.startDate) {
        this.getCostDetails(this.vehicleId);
      }
      return;
    }
    const dateVal = raw instanceof Date ? raw : new Date(raw);
    this.endDate = this.datePipe.transform(dateVal, 'yyyy-MM-dd');
    this.customDateText = this.startDate && this.endDate ? `${this.startDate} - ${this.endDate}` : '';
    // If startDate is not set, use endDate as both (single-day filter)
    const from = this.startDate || this.endDate;
    const to = this.endDate;
    this.getCostDetails(this.vehicleId, from, to);
  }

  onClickFilterButton(event: any, picker: any) {
    this.selectedButton = event;
    if (event === 'Custom') {
      this.startDate = '';
      this.endDate = '';
      this.customSelected = true;
      this.dateSelected = false;
      picker.open();
    } else {
      this.customSelected = false;
      this.dateText = event;
      picker.close();
      if (event === 'Today') {
        this.startDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.dateText = event;
      } else if (event === 'Last 7 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 7)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      } else if (event === 'Last 15 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 15)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      } else if (event === 'Last 30 Days') {
        this.startDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 30)),
          'yyyy-MM-dd'
        );
        // end date should be yesterday
        this.endDate = this.datePipe.transform(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        );
        this.dateText = event;
      }
      // After quick selection, fetch filtered list
      if (this.startDate && this.endDate) {
        this.getCostDetails(this.vehicleId, this.startDate, this.endDate);
      }
    }
  }

  clearDateFilter() {
    this.startDate = '';
    this.endDate = '';
    this.customDateText = '';
    this.getCostDetails(this.vehicleId);
  }
}
