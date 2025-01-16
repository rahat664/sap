import {
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexStroke,
  ApexXAxis,
  ChartComponent,
} from 'ng-apexcharts';
import {timer} from "rxjs";

export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  colors: string[];
  tooltip: ApexTooltip;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent {
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() seriesData: any = [];
  @Input() colors: string[] = ['#1DBF73', '#208B99', '#F0614E'];
  @Input() categories: any = [];
  @Input() selectedYear: any = '';
  @Input() selectedMonth: any = '';
  @Input() numberOfTrips = [];

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    timer(1200).subscribe(() => {
      const selectedYear = this.selectedYear;
      const selectedMonth = this.selectedMonth;
      const colors = this.colors;
      const numberOfTrips = this.numberOfTrips;
      let index = -1;
      this.chartOptions = {
        series: changes['seriesData'].currentValue,
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
          lineCap: 'round',
          colors: colors,
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
        tooltip: {
          x: {
            formatter: function (value) {
              return `${value.toString().length === 1 ? '0' : ''}${value}-${selectedMonth}-${selectedYear} <b>(${numberOfTrips[value - 1] ? numberOfTrips[value - 1] : 'No'} Trips)</b>`;
            },
          },
          marker: {
            show: false,
          },
        },
        xaxis: {
          categories: changes['categories'].currentValue,
          floating: false,
          decimalsInFloat: 0,
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              return value == null ? 'N/A' : value.toFixed(0);
            },
          },
        },
      };
    });
  }

  ngOnInit() {
    timer(1200).subscribe(() => {
      const selectedYear = this.selectedYear;
      const selectedMonth = this.selectedMonth;
      const colors = this.colors;
      const numberOfTrips = this.numberOfTrips;
      console.log(numberOfTrips);
      let index = -1;
      this.chartOptions = {
        series: this.seriesData,
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
          lineCap: 'round',
          colors: colors,
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
        xaxis: {
          categories: this.categories,
          floating: false,
          decimalsInFloat: 0,
          tooltip: {
            enabled: false,
          },
        },
        tooltip: {
          x: {
            formatter: function (value) {
              return `${value.toString().length === 1 ? '0' : ''}${value}-${selectedMonth}-${selectedYear} <b>(${numberOfTrips[value - 1] ? numberOfTrips[value - 1] : 'No'} Trips)</b>`;
            },
          },
          marker: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              return value == null ? 'N/A' : value.toFixed(0);
            },
          },
        },
      };
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }
}
