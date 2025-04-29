import { Component, OnInit } from '@angular/core';
import { LineChartComponent } from '../../../../shared/charts/line-chart/line-chart.component';
import { MatFormField } from '@angular/material/form-field';
import {
  MatOption,
  MatSelect,
  MatSelectChange,
} from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../trip-list/services/trip.service';
import { VehicleCategory } from '../../../auth/models/response/trip';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { UserService } from '../../../profiles/services/user.service';
import { UserModel } from '../../../user-management/models/user.model';
import { DashboardService } from '../../services/dashboard.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-transporter-rate-analysis',
  imports: [
    LineChartComponent,
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    NgForOf,
    NgIf,
  ],
  templateUrl: './transporter-rate-analysis.component.html',
  styleUrl: './transporter-rate-analysis.component.scss',
})
export class TransporterRateAnalysisComponent implements OnInit {
  chartType = 'all';
  vehicleTypeLists: VehicleCategory[] = [];
  fromDate = '';
  toDate = '';
  districts = [];
  transporterLists: UserModel[] = [];

  // make a year array which contain from 2024 to current year
  yearList = Array.from(
    { length: new Date().getFullYear() - 2023 },
    (_, i) => 2024 + i
  );
  selectedYear = new Date().getFullYear();
  unloadingDistrict = '';
  loadingDistrict = '';
  vehicleType = '';
  transporter = '';
  seriesdata = [];
  numberOfTrips = [];
  colors = [];
  categories = [];
  customerCode: string = '';
  datatype: string = 'daily';
  dateFilterApplied: boolean = false;
  paymentType: string = '';
  tripType: string = '';
  private routerSubs: Subscription;
  tripTypeId: any;

  constructor(
    private trip: TripService,
    private user: UserService,
    private service: DashboardService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe
  ) {
    this.resetColorsAndSeriesData();
  }

  changeChartType($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  ngOnInit() {
    if (this.routerSubs) {
      this.routerSubs.unsubscribe();
    }
    this.resetColorsAndSeriesData();

    this.datatype = 'daily';
    this.getVehicleTypeList();
    this.getDistrictList();
    this.getTransporterList();
    timer(100).subscribe(() => {
      this.routerSubs = this.activatedRoute.queryParams.subscribe(params => {
        this.paymentType = params['paymentType'] ? params['paymentType'] : '';
        this.tripType = params['tripType'] ? params['tripType'] : '';
        this.vehicleType = params['truckTypeId'] ? params['truckTypeId'] : '';
        this.customerCode = params['customerCode']
          ? params['customerCode']
          : '';
        if (params['fromDate'] && params['toDate']) {
          this.resetColorsAndSeriesData();
          this.dateFilterApplied = true;
          this.fromDate = params['fromDate'];
          this.toDate = params['toDate'];
          this.getTransporterRateAnalysisData();
        } else {
          this.resetColorsAndSeriesData();
          this.dateFilterApplied = false;
          this.calculateFromAndToDate();
          this.getTransporterRateAnalysisData();
        }
      });
    });
  }

  getVehicleTypeList() {
    this.trip.getVehicleTypeList().subscribe(res => {
      this.vehicleTypeLists = res.data;
    });
  }

  private getDistrictList() {
    this.trip.getDistricts().subscribe((res: any) => {
      this.districts = res.data;
    });
  }

  private getTransporterList() {
    this.user.getTransporter(0, 1000).subscribe((res: any) => {
      this.transporterLists = res.data;
      // sort the transporter list by name
      this.transporterLists.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    });
  }

  private getTransporterRateAnalysisData() {
    this.categories = [];
    this.seriesdata = [];
    this.colors = [];
    // calculate the number of days will be difference between fromdate and todate

    if (this.datatype === 'daily') {
      if (!this.dateFilterApplied) {
        this.calculateFromAndToDate();
      }
      const daysDifference = Math.floor(
        (new Date(this.toDate).getTime() - new Date(this.fromDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // catagories will be the dates like 2024-01-01 to 2024-01-31
      for (let i = 0; i <= daysDifference; i++) {
        this.categories.push(
          this.datePipe.transform(
            new Date(
              new Date(this.fromDate).getTime() + i * 24 * 60 * 60 * 1000
            ),
            'dd-MMM-yyyy'
          )
        );
      }
      this.categories = this.categories.reverse();
    } else if (this.datatype === 'monthly') {
      if (!this.dateFilterApplied) {
        //fromdate will be the current year first date
        const fromDate = new Date();
        fromDate.setMonth(0);
        fromDate.setDate(1);
        this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd');
        // todate will be the current date
        const toDate = new Date();
        this.toDate = this.datePipe.transform(toDate, 'yyyy-MM-dd');
      }
      const date = new Date(this.fromDate);
      date.setDate(1);
      const endDate = new Date(this.toDate);

      while (date <= endDate) {
        this.categories.push(this.datePipe.transform(date, 'MMM-yyyy'));
        date.setMonth(date.getMonth() + 1);
      }
      const firstMonthStartingDate = new Date(this.fromDate);
      // if the first month is not starting from the first date then apply a logic

      //if fromdate and toDate month is same then we need to show only one month
      if (this.categories.length == 1) {
        this.categories[0] =
          this.categories[0] +
          '|' +
          firstMonthStartingDate.getDate() +
          '-' +
          endDate.getDate();
      } else {
        if (firstMonthStartingDate.getDate() != 1) {
          const firstMonthDays = new Date(
            firstMonthStartingDate.getFullYear(),
            firstMonthStartingDate.getMonth() + 1,
            0
          ).getDate();
          this.categories[0] =
            this.categories[0] +
            '|' +
            firstMonthStartingDate.getDate() +
            '-' +
            firstMonthDays;
        }

        const lastMonthEndingDate = new Date(this.toDate);
        // if the last month is not ending at the last date then apply a logic
        if (lastMonthEndingDate.getDate() != 1) {
          const lastMonthDays = new Date(
            lastMonthEndingDate.getFullYear(),
            lastMonthEndingDate.getMonth() + 1,
            0
          ).getDate();
          this.categories[this.categories.length - 1] =
            this.categories[this.categories.length - 1] +
            '|' +
            '1-' +
            lastMonthEndingDate.getDate();
        }
      }
    }

    this.service
      .getTransporterRateAnalysisData(
        this.datatype,
        this.fromDate,
        this.toDate,
        this.transporter,
        this.vehicleType,
        this.loadingDistrict,
        this.unloadingDistrict,
        this.customerCode,
        this.paymentType,
        this.tripType
      )
      .subscribe((res: any) => {
        this.parseSeriesDataAndColorsFromResponse(res.data);
      });
  }

  onVehicleTypeChange($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  onUnloadingDistrictChange($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  onLoadingDistrictChange($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  onTransporterChange($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  onMonthChange($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  onYearChange($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  private parseSeriesDataAndColorsFromResponse(data) {
    if (this.chartType === 'high') {
      const singleSeriesData = Array(this.categories.length).fill(null);
      this.numberOfTrips = Array(this.categories.length).fill(null);
      data.forEach((item: any) => {
        const splitedDate = item.period?.split('-');
        const date =
          this.datatype === 'daily'
            ? parseInt(splitedDate[2])
            : parseInt(splitedDate[1]);
        // if date starting from 0 then remove the 0
        const selectedIndex = this.findIndexOfDate(date, this.datatype);
        singleSeriesData[selectedIndex] =
          item.minRate != null ? item.maxRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[selectedIndex] = item.totalTrips ? item.totalTrips : 0;
      });
      this.seriesdata.push({
        name: 'Highest Rate',
        data: singleSeriesData,
        color: '#1DBF73',
      });

      this.colors.push('#1DBF73');
    } else if (this.chartType === 'low') {
      const singleSeriesData = Array(this.categories.length).fill(null);
      this.numberOfTrips = Array(this.categories.length).fill(null);
      data.forEach((item: any) => {
        const splitedDate = item.period?.split('-');
        const date =
          this.datatype === 'daily'
            ? parseInt(splitedDate[2])
            : parseInt(splitedDate[1]);
        // if date starting from 0 then remove the 0
        const selectedIndex = this.findIndexOfDate(date, this.datatype);
        singleSeriesData[selectedIndex] =
          item.minRate != null ? item.minRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[selectedIndex] = item.totalTrips ? item.totalTrips : 0;
      });
      this.seriesdata.push({
        name: 'Lowest Rate',
        data: singleSeriesData,
        color: '#F0614E',
      });
      this.colors.push('#F0614E');
    } else if (this.chartType === 'average') {
      const singleSeriesData = Array(this.categories.length).fill(null);
      this.numberOfTrips = Array(this.categories.length).fill(null);
      data.forEach((item: any) => {
        const splitedDate = item.period?.split('-');
        const date =
          this.datatype === 'daily'
            ? parseInt(splitedDate[2])
            : parseInt(splitedDate[1]);
        // if date starting from 0 then remove the 0
        const selectedIndex = this.findIndexOfDate(date, this.datatype);
        singleSeriesData[selectedIndex] =
          item.avgRate != null ? item.avgRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[selectedIndex] = item.totalTrips ? item.totalTrips : 0;
      });
      this.seriesdata.push({
        name: 'Average Rate',
        data: singleSeriesData,
        color: '#208B99',
      });
      this.colors.push('#208B99');
    } else if (this.chartType == 'all') {
      const singleSeriesDataHigh = Array(this.categories.length).fill(null);
      const singleSeriesDataLow = Array(this.categories.length).fill(null);
      const singleSeriesDataAverage = Array(this.categories.length).fill(null);
      this.numberOfTrips = Array(this.categories.length).fill(null);
      data.forEach((item: any) => {
        const splitedDate = item.period?.split('-');
        const date =
          this.datatype === 'daily'
            ? parseInt(splitedDate[2])
            : parseInt(splitedDate[1]);
        const selectedIndex = this.findIndexOfDate(date, this.datatype);
        singleSeriesDataHigh[selectedIndex] =
          item.maxRate != null ? item.maxRate : item.totalTrips ? 0 : null;
        singleSeriesDataLow[selectedIndex] =
          item.minRate != null ? item.minRate : item.totalTrips ? 0 : null;
        singleSeriesDataAverage[selectedIndex] =
          item.avgRate != null ? item.avgRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[selectedIndex] = item.totalTrips
          ? item.totalTrips
          : 0;
        // if date starting from 0 then remove the 0
      });
      this.seriesdata.push({
        name: 'Highest Rate',
        data: singleSeriesDataHigh,
        color: '#1DBF73',
      });
      this.seriesdata.push({
        name: 'Average Rate',
        data: singleSeriesDataAverage,
        color: '#208B99',
      });
      this.seriesdata.push({
        name: 'Lowest Rate',
        data: singleSeriesDataLow,
        color: '#F0614E',
      });
      this.colors.push('#1DBF73');
      this.colors.push('#208B99');
      this.colors.push('#F0614E');
    }
  }

  resetColorsAndSeriesData() {
    this.seriesdata = [];
    this.categories = [];
    this.numberOfTrips = [];
    this.numberOfTrips = [];
  }

  clearAll() {
    this.transporter = '';
    this.vehicleType = '';
    this.loadingDistrict = '';
    this.unloadingDistrict = '';
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  private calculateFromAndToDate() {
    this.fromDate = '';
    this.toDate = '';
    // fromdate will be the current month first date
    const fromDate = new Date();
    fromDate.setDate(1);
    this.fromDate = this.datePipe.transform(fromDate, 'yyyy-MM-dd');
    // todate will be the current date
    const toDate = new Date();
    this.toDate = this.datePipe.transform(toDate, 'yyyy-MM-dd');
  }

  onDataTypeChange($event: any) {
    this.datatype = $event.value;
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  private findIndexOfDate(date: number, datatype: string) {
    let selectedIndex = 0;
    if (datatype === 'daily') {
      for (let i = 0; i < this.categories?.length; i++) {
        const splitedCategory = this.categories[i].split('-');
        if (parseInt(splitedCategory[0]) == date) {
          selectedIndex = i;
        }
      }
    } else {
      debugger;
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

      const selectedMonthName = monthNames[date-1];

      for (let i = 0; i < this.categories?.length; i++) {
        if (this.categories[i].includes(selectedMonthName)) {
          selectedIndex = i;
        }
      }
    }
    return selectedIndex;
  }
}
