import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { timer } from 'rxjs';
import { NgForOf } from '@angular/common';

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
  responsive: ApexResponsive;
  plotOptions: ApexPlotOptions;
  annotations: ApexAnnotations;
}

@Component({
  selector: 'app-line-chart',
  imports: [ChartComponent, NgForOf],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild('chart') chart: ChartComponent;
  @ViewChild('chartContainers', { static: false }) chartContainers: ElementRef;
  @ViewChild('yAxisContainers', { static: false }) yAxisContainers: ElementRef;
  @ViewChild('yAxisStickyContainers', { static: false })
  yAxisStickyContainers: ElementRef;
  private previousYAxisNodes: NodeListOf<HTMLElement> | null = null;
  public chartOptions: Partial<ChartOptions>;
  @Input() seriesData: any = [];
  @Input() colors: string[] = [];
  @Input() categories: any = [];
  @Input() selectedYear: any = '';
  @Input() selectedMonth: any = '';
  @Input() numberOfTrips = [];
  private defaultContainerWidth: number = 0;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.seriesData && this.categories) {
      timer(1200).subscribe(() => {
        let colors = [],
          numberOfTrips = [],
          categories = [];
        colors = this.colors;
        numberOfTrips = this.numberOfTrips;
        categories = this.categories;

        let index = -1;
        this.chartOptions = {
          series: this.seriesData,
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false,
              autoScaleYaxis: true,
            },
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
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'straight',
            lineCap: 'round',
            colors: colors,
          },
          legend: {
            show: false,
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
            shared: true,
            x: {
              formatter: function (value) {
                return `${categories[value - 1]} <b>(${numberOfTrips[value - 1] ? numberOfTrips[value - 1] : 'No'} Trips)</b>`;
              },
            },
            marker: {
              show: false,
            },
            hideEmptySeries: false,
          },
          xaxis: {
            categories: this.categories,
            floating: false,
            decimalsInFloat: 0,
            tooltip: {
              enabled: false,
            },
            labels: {
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
  }
  makeYAxisSticky() {
    timer(200).subscribe(() => {
      if (!this.yAxisContainers?.nativeElement) return;
      const yAxisContainer = this.yAxisContainers.nativeElement;
      while (yAxisContainer.firstChild) {
        yAxisContainer.removeChild(yAxisContainer.firstChild);
      }

      // Get the labels from the ApexChart instance
      const chart = this.chartOptions?.yaxis; // Get ApexCharts instance
      if (!chart) return;
      const uniqueLabels = new Set<string>(); // ✅ Avoid duplicates
      // Extract Y-axis labels from rendered SVG
      let yAxisElements = this.chartContainers.nativeElement.querySelectorAll(
        '.apexcharts-yaxis text tspan'
      );
      this.previousYAxisNodes = yAxisElements as NodeListOf<HTMLElement>;
      if (!yAxisElements) return;
      yAxisElements.forEach((el: any) => {
        const label = el.textContent;
        if (label && !uniqueLabels.has(label)) {
          uniqueLabels.add(label); // ✅ Track added labels to prevent repetition
          const labelDiv = document.createElement('div');
          labelDiv.style.color = '#777777';
          labelDiv.style.fontSize = '12px';
          labelDiv.style.fontWeight = 'normal';
          labelDiv.style.textAlign = 'right';
          labelDiv.textContent = label;
          yAxisContainer.appendChild(labelDiv);
        }
      });
      const yAxisElement = this.chartContainers.nativeElement.querySelectorAll(
        '.apexcharts-yaxis'
      )[0] as HTMLElement;
      const yAxisStickyElement = this.yAxisStickyContainers.nativeElement;
      yAxisStickyElement.style.height = `382px`;
      yAxisStickyElement.style.paddingBottom = '32px';
      // remove y axis element from the chart
      yAxisElement.style.display = 'none'; // ✅ Hide original Y-axis
      // ✅ Force reflow for updates
      this.cd.detectChanges();
    });
    // Delay to ensure chart renders first
  }
  ngOnInit() {
    timer(1200).subscribe(() => {
      let colors = [],
        numberOfTrips = [],
        categories = [];
      colors = this.colors;
      numberOfTrips = this.numberOfTrips;
      categories = this.categories;
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
          events: {
            mounted: (chartContext, config) => {
              this.createCustomXAxis();
              this.makeYAxisSticky();
            },
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
          show: false,
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
          labels: {
            show: false,
          },
        },
        tooltip: {
          shared: true,
          x: {
            formatter: function (value) {
              return `${categories[value - 1]} <b>(${numberOfTrips[value - 1] ? numberOfTrips[value - 1] : 'No'} Trips)</b>`;
            },
          },
          marker: {
            show: false,
          },
          hideEmptySeries: false,
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

  createCustomXAxis() {
    const chartContainer = this.chartContainers.nativeElement;
    if (this.defaultContainerWidth === 0) {
      this.defaultContainerWidth = chartContainer.clientWidth;
    }

    const chartFirstChild = chartContainer.firstChild;
    if (!chartFirstChild) return;
    const chart = chartFirstChild.firstChild;
    chart.style.minHeight = '350px';

    // Remove existing x-axis (prevents duplicates)
    const oldXAxis = document.getElementById('custom-xaxis-line');
    if (oldXAxis) oldXAxis.remove();

    // Create a new div for the custom x-axis
    const xAxisDiv = document.createElement('div');
    xAxisDiv.setAttribute('id', 'custom-xaxis-line');
    xAxisDiv.style.display = 'flex';
    xAxisDiv.style.justifyContent = 'space-between';
    xAxisDiv.style.left = '0';
    xAxisDiv.style.width = '100%';
    xAxisDiv.style.marginLeft = '28px';
    xAxisDiv.style.marginRight = '16px';
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
      labelSpan.style.display = 'inline-block';
      labelSpan.style.minWidth = `${this.defaultContainerWidth / labels.length - 40}px`;
      labelSpan.style.maxWidth = `${this.defaultContainerWidth / labels.length - 40}px`;
      labelSpan.style.color = '#777777';
      labelSpan.style.fontSize = '12px';
      labelSpan.style.fontWeight = 'normal';
      labelSpan.style.textAlign = 'center';
      labelSpan.style.flex = '1';
      if (labels.indexOf(label) === 0) {
        labelSpan.style.marginLeft = '36px';
      }
      xAxisDiv.appendChild(labelSpan);
    });

    const chartWidth = this.defaultContainerWidth;
    const labelWidth = 100;
    const requiredWidth = labels.length * labelWidth;
    const chartContainerWidth =
      requiredWidth > chartWidth ? requiredWidth : chartWidth;
    chartContainer.style.width = `${chartContainerWidth}px`;

    // Append custom x-axis below the chart
    chartContainer.appendChild(xAxisDiv);
    // Set the width of the custom x-axis
  }
}
