import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { LineChartComponent } from '../../../../shared/charts/line-chart/line-chart.component';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect, MatSelectChange } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../trip-list/services/trip.service';
import { VehicleCategory } from '../../../auth/models/response/trip';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { UserService } from '../../../profiles/services/user.service';
import { UserModel } from '../../../user-management/models/user.model';
import { DashboardService } from '../../services/dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { map, startWith, takeUntil, distinctUntilChanged } from 'rxjs/operators';

type ChartType = 'high' | 'low' | 'average' | 'all';
type DataType = 'daily' | 'monthly';

interface RatePoint {
  period: string;       // e.g. '2024-07-14' (daily) or '2024-07' (monthly) depending on API
  maxRate: number | null;
  minRate: number | null;
  avgRate: number | null;
  totalTrips: number | null;
}

interface Series {
  name: string;
  data: (number | null)[];
  color: string;
}

@Component({
  selector: 'app-transporter-rate-analysis',
  imports: [
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    NgForOf,
    NgIf,
    LineChartComponent,
  ],
  templateUrl: './transporter-rate-analysis.component.html',
  styleUrl: './transporter-rate-analysis.component.scss',
})
export class TransporterRateAnalysisComponent implements OnInit, OnDestroy {
  // Inject (safer for tree-shaking)
  private readonly trip = inject(TripService);
  private readonly user = inject(UserService);
  private readonly service = inject(DashboardService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly datePipe = inject(DatePipe);

  // UI state
  chartType: ChartType = 'all';
  datatype: DataType = 'daily';

  // Filters
  vehicleTypeLists: VehicleCategory[] = [];
  transporterLists: UserModel[] = [];
  districts: any[] = [];
  customerCode = '';
  paymentType = '';
  transporterCodes = '';
  tripType = '';
  tripTypeId: any;
  unloadingDistrict = '';
  loadingDistrict = '';
  vehicleType = '';
  transporter = '';
  fromDate = '';
  toDate = '';
  dateFilterApplied = false;

  // Chart data
  categories: string[] = [];
  seriesdata: Series[] = [];
  colors: string[] = [];
  numberOfTrips: (number | null)[] = [];
  private categoryIndex = new Map<string, number>(); // label -> index

  // Year list (2024..current)
  readonly yearList = Array.from(
    { length: new Date().getFullYear() - 2023 },
    (_, i) => 2024 + i
  );
  selectedYear = new Date().getFullYear();

  // Lifecycle
  private readonly destroy$ = new Subject<void>();

  // Colors
  private static readonly COLOR_HIGH = '#1DBF73';
  private static readonly COLOR_AVG = '#208B99';
  private static readonly COLOR_LOW = '#F0614E';

  ngOnInit() {
    this.resetAll();
    this.getVehicleTypeList();
    this.getDistrictList();
    this.getTransporterList();

    // Respond to route params and resolved data in one stream
    combineLatest([
      this.activatedRoute.queryParams.pipe(
        map(params => ({
          paymentType: params['paymentType'] || '',
          tripType: params['tripType'] || '',
          vehicleType: params['truckTypeId'] || '',
          customerCode: params['customerCode'] || '',
          fromDate: params['fromDate'] || '',
          toDate: params['toDate'] || '',
          transporterCodes: params['transporterCodes'] || '',
        })),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        startWith({
          paymentType: this.paymentType,
          tripType: this.tripType,
          vehicleType: this.vehicleType,
          customerCode: this.customerCode,
          fromDate: this.fromDate,
          toDate: this.toDate,
          transporterCodes: this.transporterCodes
        })
      ),
      this.activatedRoute.data
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([qp, data]: any) => {
        this.paymentType = qp.paymentType;
        this.tripType = qp.tripType;
        this.vehicleType = qp.vehicleType;
        this.customerCode = qp.customerCode;

        if (qp.fromDate && qp.toDate) {
          this.dateFilterApplied = true;
          this.fromDate = qp.fromDate;
          this.toDate = qp.toDate;
        } else {
          this.dateFilterApplied = false;
          this.calculateFromAndToDate();
        }

        // Only build from resolver if data is present
        const resolved = data?.dashboardData?.data?.transporterRateAnalysisData?.data as RatePoint[] | undefined;
        this.buildCategories();
        if (Array.isArray(resolved) && resolved.length > 0) {
          this.buildSeries(resolved);
        } else if (data && data.dashboardData) {
          // If resolver ran but no data, don't fetch again
          this.buildSeries([]);
        } else {
          // Only fetch if resolver hasn't run yet
          this.fetchAndBuild();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= UI events =======

  changeChartType(_: MatSelectChange) {
    this.triggerReload();
  }

  onUnloadingDistrictChange(_: MatSelectChange) {
    this.triggerReload();
  }

  onLoadingDistrictChange(_: MatSelectChange) {
    this.triggerReload();
  }

  onTransporterChange(_: MatSelectChange) {
    this.triggerReload();
  }

  onDataTypeChange(evt: MatSelectChange) {
    this.datatype = evt.value as DataType;
    this.triggerReload();
  }

  clearAll() {
    this.transporter = '';
    this.vehicleType = '';
    this.loadingDistrict = '';
    this.unloadingDistrict = '';
    this.triggerReload();
  }

  // ======= Data loads =======

  private getVehicleTypeList() {
    this.trip
      .getVehicleTypeList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => (this.vehicleTypeLists = res.data ?? []));
  }

  private getDistrictList() {
    this.trip
      .getDistricts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => (this.districts = res.data ?? []));
  }

  private getTransporterList() {
    this.user
      .getTransporter(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.transporterLists = (res.data ?? []).sort(
          (a: UserModel, b: UserModel) =>
            (a.name || '').localeCompare(b.name || '')
        );
      });
  }

  private fetchAndBuild() {
    this.service
      .getTransporterRateAnalysisData(
        this.datatype,
        this.fromDate,
        this.toDate,
        this.vehicleType,
        this.loadingDistrict,
        this.unloadingDistrict,
        this.customerCode,
        this.paymentType,
        this.tripType,
        this.transporterCodes
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        const data: RatePoint[] = res?.data ?? [];
        this.buildSeries(data);
      });
  }

  // ======= Builders =======

  private triggerReload() {
    this.resetChartState();
    if (!this.dateFilterApplied) this.calculateFromAndToDate();
    this.buildCategories();
    this.fetchAndBuild();
  }

  private resetChartState() {
    this.seriesdata = [];
    this.categories = [];
    this.colors = [];
    this.numberOfTrips = [];
    this.categoryIndex.clear();
  }

  private resetAll() {
    this.chartType = 'all';
    this.datatype = 'daily';
    this.resetChartState();
  }

  private calculateFromAndToDate() {
    const from = new Date();
    from.setDate(1);
    this.fromDate = this.datePipe.transform(from, 'yyyy-MM-dd') || '';

    const to = new Date();
    this.toDate = this.datePipe.transform(to, 'yyyy-MM-dd') || '';
  }

  private buildCategories() {
    this.categories = [];
    this.categoryIndex.clear();

    if (this.datatype === 'daily') {
      // Use inclusive range [from..to], chronological order
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const label = this.datePipe.transform(d, 'dd-MMM-yyyy')!;
        this.categoryIndex.set(label, this.categories.length);
        this.categories.push(label);
      }
      this.categories = this.categories.reverse();
    } else {
      // monthly
      const from = new Date(this.fromDate);
      from.setDate(1);
      const to = new Date(this.toDate);
      to.setDate(1);
      const end = new Date(this.toDate);

      const labels: string[] = [];
      const cursor = new Date(from);
      while (cursor <= to) {
        const base = this.datePipe.transform(cursor, 'MMM-yyyy')!;
        labels.push(base);
        cursor.setMonth(cursor.getMonth() + 1);
      }

      // Append day ranges on first/last month if partials
      if (labels.length === 1) {
        const first = new Date(this.fromDate);
        const last = new Date(this.toDate);
        labels[0] = `${labels[0]}|${first.getDate()}-${last.getDate()}`;
      } else if (labels.length > 1) {
        const first = new Date(this.fromDate);
        if (first.getDate() !== 1) {
          const daysInFirstMonth = new Date(
            first.getFullYear(),
            first.getMonth() + 1,
            0
          ).getDate();
          labels[0] = `${labels[0]}|${first.getDate()}-${daysInFirstMonth}`;
        }
        const last = new Date(this.toDate);
        const lastMonthDays = new Date(
          last.getFullYear(),
          last.getMonth() + 1,
          0
        ).getDate();
        if (last.getDate() !== lastMonthDays) {
          labels[labels.length - 1] = `${labels.at(-1)}|1-${last.getDate()}`;
        }
      }

      this.categories = labels
      labels.forEach((l, i) => this.categoryIndex.set(l, i));
    }

    // ensure numberOfTrips aligned
    this.numberOfTrips = Array(this.categories.length).fill(null);
  }

  private buildSeries(data: RatePoint[]) {
    // Prepare blank arrays
    const makeBlank = () =>
      Array(this.categories.length).fill(null) as (number | null)[];
    const high = makeBlank();
    const low = makeBlank();
    const avg = makeBlank();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (const item of data) {
      // Build the label that exactly matches our categories
      let label = '';
      if (this.datatype === 'daily') {
        // Expecting 'YYYY-MM-DD'
        const d = new Date(item.period);
        label = this.datePipe.transform(d, 'dd-MMM-yyyy')!;
      } else {
        // Expecting 'YYYY-MM' or 'YYYY-MM-DD' -> normalize to MMM-YYYY
        const [y, m] = item.period.split('-').map(x => parseInt(x, 10));
        const monName = monthNames[(m ?? 1) - 1];
        label = `${monName}-${y}`;
        // If our categories carry appended day ranges, this still matches because the base string is at the start.
        // We'll find by startsWith to resolve the exact category entry.
        const fullLabel = this.categories.find(c => c.startsWith(label));
        if (fullLabel) label = fullLabel;
      }

      const idx = this.categoryIndex.get(label);
      if (idx === undefined) continue;

      // Fill series safely (prefer null -> 0 when there are trips=0)
      if (item.maxRate != null) high[idx] = item.maxRate;
      else if (item.totalTrips) high[idx] = 0;

      if (item.minRate != null) low[idx] = item.minRate;
      else if (item.totalTrips) low[idx] = 0;

      if (item.avgRate != null) avg[idx] = item.avgRate;
      else if (item.totalTrips) avg[idx] = 0;

      this.numberOfTrips[idx] = item.totalTrips ?? 0;
    }

    this.seriesdata = [];
    this.colors = [];

    switch (this.chartType) {
      case 'high':
        this.seriesdata.push({
          name: 'Highest Rate',
          data: high,
          color: TransporterRateAnalysisComponent.COLOR_HIGH,
        });
        this.colors.push(TransporterRateAnalysisComponent.COLOR_HIGH);
        break;
      case 'low':
        this.seriesdata.push({
          name: 'Lowest Rate',
          data: low,
          color: TransporterRateAnalysisComponent.COLOR_LOW,
        });
        this.colors.push(TransporterRateAnalysisComponent.COLOR_LOW);
        break;
      case 'average':
        this.seriesdata.push({
          name: 'Average Rate',
          data: avg,
          color: TransporterRateAnalysisComponent.COLOR_AVG,
        });
        this.colors.push(TransporterRateAnalysisComponent.COLOR_AVG);
        break;
      case 'all':
      default:
        this.seriesdata.push({
          name: 'Highest Rate',
          data: high,
          color: TransporterRateAnalysisComponent.COLOR_HIGH,
        });
        this.seriesdata.push({
          name: 'Average Rate',
          data: avg,
          color: TransporterRateAnalysisComponent.COLOR_AVG,
        });
        this.seriesdata.push({
          name: 'Lowest Rate',
          data: low,
          color: TransporterRateAnalysisComponent.COLOR_LOW,
        });
        this.colors.push(
          TransporterRateAnalysisComponent.COLOR_HIGH,
          TransporterRateAnalysisComponent.COLOR_AVG,
          TransporterRateAnalysisComponent.COLOR_LOW
        );
        break;
    }
  }
}
