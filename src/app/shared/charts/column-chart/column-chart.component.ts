import {
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  OnInit,
  OnChanges,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import {
  ApexAnnotations,
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
import { timer } from 'rxjs';

export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  annotations: ApexAnnotations;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
}

@Component({
  selector: 'app-column-chart',
  imports: [NgApexchartsModule],
  templateUrl: './column-chart.component.html',
  styleUrl: './column-chart.component.scss',
})
export class ColumnChartComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chart') chart: ChartComponent;
  @ViewChild('chartContainer', { static: false }) chartContainer: ElementRef;
  @ViewChild('yAxisContainer', { static: false }) yAxisContainer: ElementRef;
  public chartOptions: Partial<ChartOptions>;
  @Input() createdValue: number[] = [];
  @Input() completedValue: number[] = [];
  @Input() categories: string[] = [];
  private defaultContainerWidth: number = 0;
  calculatedWidth: string | number;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    const colors = ['#85DAE5', '#208B99'];
    this.chartOptions = {
      series: [
        {
          name: 'Created Trip',
          data: this.createdValue || [0, 0, 0, 0, 0, 0, 0],
          color: colors[0],
        },
        {
          name: 'Completed Trip',
          data: this.completedValue || [0, 0, 0, 0, 0, 0, 0],
          color: colors[1],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        width: '100%',
        toolbar: {
          show: false,
        },
        events: {
          mounted: (chartContext, config) => {
            this.createCustomXAxis();
            this.makeYAxisSticky();
          },
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
          show: false,
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
    if (this.completedValue && this.createdValue && this.categories) {
      timer(500).subscribe(() => {
        const colors = ['#85DAE5', '#208B99'];
        this.chartOptions = {
          series: [
            {
              name: 'Created Trip',
              data: this.createdValue || [0, 0, 0, 0, 0, 0, 0],
              color: colors[0],
            },
            {
              name: 'Completed Trip',
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
            events: {
              mounted: (chartContext, config) => {
                this.createCustomXAxis();
                this.makeYAxisSticky()
              },
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
              show: false,
              style: {
                colors: '#777777',
                fontSize: '12px',
              },
              formatter: function (value) {
                return value.replace('|', '\u200B '); // Inserts a zero-width space
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
            x: {
              formatter(val: number): string {
                const splitVal = val.toString().split('|');
                const firstLine = splitVal[0];
                const secondLine = splitVal[1];
                return `${firstLine} ${secondLine ? `(${secondLine})` : ''}`;
              },
            },
            y: {
              formatter: function (val) {
                return val + `${val > 1 ? ' trips' : ' trip'}`;
              },
            },
          },
        };
      });
    }
  }

  createCustomXAxis() {
    const chartContainer = this.chartContainer.nativeElement;
    if (this.defaultContainerWidth === 0) {
      this.defaultContainerWidth = chartContainer.clientWidth;
    }
    // Remove existing x-axis (prevents duplicates)
    const oldXAxis = document.getElementById('custom-xaxis');
    if (oldXAxis) oldXAxis.remove();

    // Create a new div for the custom x-axis
    const xAxisDiv = document.createElement('div');
    xAxisDiv.setAttribute('id', 'custom-xaxis');
    xAxisDiv.style.display = 'flex';
    xAxisDiv.style.justifyContent = 'space-between';
    xAxisDiv.style.left = '0';
    xAxisDiv.style.width = '100%';
    xAxisDiv.style.marginTop = '-24px';
    xAxisDiv.style.paddingLeft = '40px';
    xAxisDiv.style.paddingRight = '16px';
    // Get the labels from the chart options
    const labels = this.chartOptions.xaxis.categories;
    // Dynamically adjust width based on the number of categories

    // Calculate required width: labels * 100px
    labels.forEach(label => {
      const labelSpan = document.createElement('span');
      // break line by spliting the value by '|'
      const labelValue = label.split('|');
      labelSpan.textContent = labelValue[0];
      // show the second line with a smaller font size
      if (labelValue[1]) {
        const labelSpan2 = document.createElement('span');
        labelSpan2.textContent = `(${labelValue[1]})`;
        labelSpan2.style.fontSize = '10px';
        labelSpan2.style.display = 'block';
        labelSpan2.style.color = '#777777';
        labelSpan.appendChild(labelSpan2);
      }
      labelSpan.style.color = '#777777';
      labelSpan.style.fontSize = '12px';
      labelSpan.style.fontWeight = 'normal';
      labelSpan.style.textAlign = 'center';
      labelSpan.style.flex = '1';
      labelSpan.style.display = 'inline-block';
      labelSpan.style.minWidth = '5rem';
      xAxisDiv.appendChild(labelSpan);
    });

    const chartWidth = this.defaultContainerWidth;
    const labelWidth = 100;
    const requiredWidth = labels.length * labelWidth;
    console.log(this.defaultContainerWidth, requiredWidth, chartWidth);
    const chartContainerWidth =
      requiredWidth > chartWidth ? requiredWidth : chartWidth;
    const requiredContainerWidthInPx = `${chartContainerWidth}px`;
    console.log(requiredContainerWidthInPx);
    chartContainer.style.width = requiredContainerWidthInPx;

    // Append custom x-axis below the chart
    chartContainer.appendChild(xAxisDiv);
    // Set the width of the custom x-axis
  }

  makeYAxisSticky() {
    const chartEl = this.chartContainer.nativeElement;
    const yAxisEl = chartEl.querySelector('.apexcharts-yaxis');
    console.log(yAxisEl);

    if (yAxisEl) {
      const clonedYAxis = yAxisEl.cloneNode(true) as HTMLElement;
      clonedYAxis.style.display = 'block'; // Ensure it's visible
      clonedYAxis.style.position = 'relative';
      clonedYAxis.style.left = '0';
      clonedYAxis.style.zIndex = '100';

      // Clear previous Y-axis content and append the new one
      const yAxisContainer = this.yAxisContainer.nativeElement;
      yAxisContainer.innerHTML = ''; // Remove old cloned elements
      yAxisContainer.appendChild(clonedYAxis);
      console.log(yAxisContainer);
    }
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }
}
