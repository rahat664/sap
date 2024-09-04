import { Component, ViewChild } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexResponsive,
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
};

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'], // Corrected 'styleUrl' to 'styleUrls'
})
export class PieChartComponent {
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    const colors = ['#91CAFF', '#F8BBB3', '#FFD182'];
    let index = -1;

    this.chartOptions = {
      series: [14, 4, 2],
      chart: {
        width: 340,
        type: 'pie',
      },
      labels: ['Received', 'Pending', 'Not received'],
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
            // change the legend marker to rectangle
            return `<span style="display:inline-block; width:13px; height:13px; border-radius: 2px; background-color: ${colors[index]};"></span>`;
          },
        },
        fontSize: '12px',
        fontFamily: 'Inter',
        fontWeight: 400,
        labels: {
          colors: ['#5D5D5D', '#5D5D5D', '#5D5D5D'],
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
