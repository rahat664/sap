import { Component } from '@angular/core';
import {LineChartComponent} from "../../../../shared/charts/line-chart/line-chart.component";
import {MatFormField} from "@angular/material/form-field";
import {MatOption, MatSelect, MatSelectChange} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {TripService} from "../../../trip-list/services/trip.service";
import {VehicleCategory} from "../../../auth/models/response/trip";
import {NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../../profiles/services/user.service";
import {UserModel} from "../../../user-management/models/user.model";
import {DashboardService} from "../../services/dashboard.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-transporter-rate-analysis',
  standalone: true,
  imports: [
    LineChartComponent,
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    NgForOf,
    RouterLink,
    NgIf,
  ],
  templateUrl: './transporter-rate-analysis.component.html',
  styleUrl: './transporter-rate-analysis.component.scss',
})
export class TransporterRateAnalysisComponent {
  chartType = 'all';
  vehicleTypeLists: VehicleCategory[] = [];
  districts = [];
  transporterLists: UserModel[] = [];
  monthList = [
    { value: '01', viewValue: 'January' },
    { value: '02', viewValue: 'February' },
    { value: '03', viewValue: 'March' },
    { value: '04', viewValue: 'April' },
    { value: '05', viewValue: 'May' },
    { value: '06', viewValue: 'June' },
    { value: '07', viewValue: 'July' },
    { value: '08', viewValue: 'August' },
    { value: '09', viewValue: 'September' },
    { value: '10', viewValue: 'October' },
    { value: '11', viewValue: 'November' },
    { value: '12', viewValue: 'December' },
  ];

  selectedMonth =
    (new Date().getMonth() + 1).toString().length === 1
      ? '0' + (new Date().getMonth() + 1).toString()
      : (new Date().getMonth() + 1).toString();

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
  constructor(
    private trip: TripService,
    private user: UserService,
    private service: DashboardService
  ) {}

  changeChartType($event: MatSelectChange) {
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }

  ngOnInit() {
    this.resetColorsAndSeriesData();
    this.getVehicleTypeList();
    this.getDistrictList();
    this.getTransporterList();
    this.getTransporterRateAnalysisData();
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
      this.transporterLists = res.data.responses;
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
    let dataType: string = '';
    if (this.selectedMonth && this.selectedYear) {
      dataType = 'daily';
    } else {
      dataType = 'yearly';
    }

    // get the length of the month of the selected month and year
    const daysInMonth = new Date(
      this.selectedYear,
      parseInt(this.selectedMonth),
      0
    ).getDate();
    this.categories = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    this.service
      .getTransporterRateAnalysisData(
        dataType,
        `${this.selectedYear}${this.selectedMonth ? '-' + this.selectedMonth : ''}`,
        this.transporter,
        this.vehicleType,
        this.loadingDistrict,
        this.unloadingDistrict
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
        const date = parseInt(splitedDate[2]);
        // if date starting from 0 then remove the 0
        singleSeriesData[date - 1] =
          item.minRate != null ? item.maxRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[date - 1] = item.totalTrips ? item.totalTrips : 0;
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
        const date = parseInt(splitedDate[2]);
        // if date starting from 0 then remove the 0
        singleSeriesData[date - 1] =
          item.minRate != null ? item.minRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[date - 1] = item.totalTrips ? item.totalTrips : 0;
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
        const date = parseInt(splitedDate[2]);
        // if date starting from 0 then remove the 0
        singleSeriesData[date - 1] =
          item.avgRate != null ? item.avgRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[date - 1] = item.totalTrips ? item.totalTrips : 0;
      });
      this.seriesdata.push({
        name: 'Average Rate',
        data: singleSeriesData,
        color: '#208B99',
      });
      this.colors.push('#208B99');
    } else {
      const singleSeriesDataHigh = Array(this.categories.length).fill(null);
      const singleSeriesDataLow = Array(this.categories.length).fill(null);
      const singleSeriesDataAverage = Array(this.categories.length).fill(null);
      this.numberOfTrips = Array(this.categories.length).fill(null);
      data.forEach((item: any) => {
        const splitedDate = item.period?.split('-');
        const date = parseInt(splitedDate[2]);
        // if date starting from 0 then remove the 0
        singleSeriesDataHigh[date - 1] =
          item.maxRate != null ? item.maxRate : item.totalTrips ? 0 : null;
        singleSeriesDataLow[date - 1] =
          item.minRate != null ? item.minRate : item.totalTrips ? 0 : null;
        singleSeriesDataAverage[date - 1] =
          item.avgRate != null ? item.avgRate : item.totalTrips ? 0 : null;
        this.numberOfTrips[date - 1] = item.totalTrips ? item.totalTrips : 0;
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

    // const daysInMonth = new Date(this.selectedYear, parseInt(this.selectedMonth), 0).getDate();
    // this.categories = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    // // concat year and month as dd-mm-yyyy
    //
    this.colors = ['#1DBF73', '#208B99', '#F0614E'];
    // this.seriesdata = [
    //   {
    //     name: 'Maximum Rate',
    //     data: Array(daysInMonth).fill(null)
    //   },
    //   {
    //     name: 'Average Rate',
    //     data: Array(daysInMonth).fill(null)
    //   },
    //   {
    //     name: 'Lowest Rate',
    //     data: Array(daysInMonth).fill(null)
    //   },
    // ];
  }

  clearAll() {
    this.transporter = '';
    this.vehicleType = '';
    this.loadingDistrict = '';
    this.unloadingDistrict = '';
    this.resetColorsAndSeriesData();
    this.getTransporterRateAnalysisData();
  }
}
