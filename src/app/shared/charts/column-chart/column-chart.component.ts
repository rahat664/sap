import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
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
import {timer} from "rxjs";

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
  @Input() createdValue: number[] = [];
  @Input() completedValue: number[] = [];
  @Input() categories: string[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  constructor(private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    const colors = ['#85DAE5', '#208B99'];
    this.chartOptions = {
      series: [
        {
          name: 'Trip Created',
          data: this.createdValue || [0, 0, 0, 0, 0, 0, 0],
          color: colors[0],
        },
        {
          name: 'Trip Completed',
          data: this.completedValue || [0, 0, 0, 0, 0, 0, 0],
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
          borderRadius: 4,
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
        customLegendItems: ['Trip created', 'Trip Completed'],
        itemMargin: {
          horizontal: 10,
        },
        markers: {
          fillColors: colors,
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: this.categories || [],
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
            return val + `${val > 1 ? ' trips' : ' trip'}`;
          },
        },
      },
    };
  }

  ngOnChanges() {
    timer(500).subscribe(() => {
      const colors = ['#85DAE5', '#208B99'];
      this.chartOptions = {
        series: [
          {
            name: 'Trip Created',
            data: this.createdValue || [0, 0, 0, 0, 0, 0, 0],
            color: colors[0],
          },
          {
            name: 'Trip Completed',
            data: this.completedValue || [0, 0, 0, 0, 0, 0, 0],
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
            borderRadius: 4,
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
          customLegendItems: ['Trip created', 'Trip Completed'],
          itemMargin: {
            horizontal: 10,
          },
          markers: {
            fillColors: colors,
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: this.categories || [],
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
              return val + `${val > 1 ? ' trips' : ' trip'}`;
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
