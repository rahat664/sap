import { Component } from '@angular/core';
import {LineChartComponent} from "../../../../shared/charts/line-chart/line-chart.component";

@Component({
  selector: 'app-transporter-rate-analysis',
  standalone: true,
  imports: [ LineChartComponent],
  templateUrl: './transporter-rate-analysis.component.html',
  styleUrl: './transporter-rate-analysis.component.scss',
})
export class TransporterRateAnalysisComponent {}
