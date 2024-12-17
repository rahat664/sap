import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexTooltip,
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
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chart: ChartComponent;
  @Input() value: number[] = [0, 0];
  public chartOptions: Partial<ChartOptions>;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cd.detectChanges();
  }
  ngOnChanges() {
    const colors = ['#0CD5F0', '#CCF3FB'];
    let index = -1;
    const labels = ['Received', 'Pending'];
    const customLegendItems = labels.map(
      (label, i) => `${label} - ${this.value ? this.value[i] : 0}`
    );

    this.chartOptions = {
      series: this.value || [0, 0],
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
            type: 'lighten',
          },
        },
      },
      plotOptions: {
        pie: {
          customScale: 1,
          expandOnClick: true,
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        cssClass: 'apexcharts-tooltip',
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 350,
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
            },
          },
        },
      ],
    };
  }
}
