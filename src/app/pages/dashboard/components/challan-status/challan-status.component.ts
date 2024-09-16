import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusCardComponent } from '../status-heighlight/status-card/status-card.component';
import { PieChartComponent } from '../../../../shared/charts/pie-chart/pie-chart.component';

@Component({
  selector: 'app-challan-status',
  standalone: true,
  imports: [
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    StatusCardComponent,
    PieChartComponent,
  ],
  templateUrl: './challan-status.component.html',
  styleUrl: './challan-status.component.scss',
})
export class ChallanStatusComponent {}
