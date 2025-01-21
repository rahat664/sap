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
import { timer } from 'rxjs';

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

  ngOnInit() {
    timer(1000).subscribe(() => {
      const colors = ['#85DAE5', '#208B99'];
      const total = this.value ? this.value.reduce((a, b) => a + b, 0) : 0;
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
        states: {
          hover: {
            filter: {
              type: 'none',
            },
          },
        },
        legend: {
          position: 'bottom',
          onItemHover: {
            highlightDataSeries: false,
          },
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
        plotOptions: {
          pie: {
            customScale: 1,
            expandOnClick: true,
          },
        },
        tooltip: {
          enabled: true,
          fillSeriesColor: false,
          onDatasetHover: {
            highlightDataSeries: false,
          },
        },
      };
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }
  ngOnChanges() {
    timer(1000).subscribe(() => {
      const colors = ['#208B99', '#D8EFF9'];
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
          onItemHover: {
            highlightDataSeries: false,
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
              type: 'none',
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
          onDatasetHover: {
            highlightDataSeries: false,
          },
          y: {
            formatter(val: number, opts?: any): string {
              console.log(opts.globals?.series);
              return `${((val / opts.globals?.series?.reduce((a, b) => a + b, 0)) * 100).toFixed(2)}%`;
            },
          },
        },
      };
    });
  }
}
