import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend: ApexLegend;
  colors: string[];
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  plotOptions: ApexPlotOptions;
  states: ApexStates;
};

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnChanges {
  @ViewChild('chart') chart: ChartComponent;
  @Input() value: number[] = [0, 0];
  public chartOptions: Partial<ChartOptions>;

  constructor() {}

  ngOnChanges() {
    const colors = ['#91CAFF', '#CCF3FB'];
    let index = -1;
    const labels = ['Received', 'Pending'];
    const customLegendItems = labels.map(
      (label, i) => `${label} - ${this.value[i]}`
    );

    this.chartOptions = {
      series: this.value,
      chart: {
        width: 350,
        type: 'pie',
      },
      labels,
      colors,
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'bottom',
        markers: {
          fillColors: colors,
          customHTML: function () {
            index++;
            return `<span style="display:inline-block; width:13px; height:13px; border-radius: 2px; background-color: ${colors[index]};"></span>`;
          },
        },
        fontSize: '12px',
        fontFamily: 'Inter',
        fontWeight: 400,
        formatter: function (seriesName, opts) {
          return customLegendItems[opts.seriesIndex];
        },
        labels: {
          colors: ['#5D5D5D', '#5D5D5D', '#5D5D5D'],
        },
      },
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.5,
          },
        },
      },
      plotOptions: {
        pie: {
          customScale: 0.8,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }
}
