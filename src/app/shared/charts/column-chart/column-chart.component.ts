import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

@Component({
  selector: 'app-column-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.scss',
})
export class ColumnChartComponent {
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    const colors = ['#E5EAEB', '#0CD5F0'];
    this.chartOptions = {
      series: [
        {
          name: 'Net Profit',
          data: [44, 55, 57, 56, 61, 58],
          color: colors[0],
        },
        {
          name: 'Revenue',
          data: [76, 85, 101, 98, 87, 105],
          color: colors[1],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: -42,
        offsetY: -1,
        fontSize: '12px',
        customLegendItems: ['Trip created', 'Achievement'],
        itemMargin: {
          horizontal: 10,
        },
        markers: {
          fillColors: colors,
          radius: 0,
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        labels: {
          style: {
            colors: '#777777',
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#777777',
            fontSize: '12px',
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return '$ ' + val + ' thousands';
          },
        },
      },
    };
  }
}
