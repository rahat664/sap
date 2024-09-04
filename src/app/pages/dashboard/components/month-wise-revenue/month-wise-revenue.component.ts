import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ColumnChartComponent } from '../../../../shared/charts/column-chart/column-chart.component';

@Component({
  selector: 'app-month-wise-revenue',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    ColumnChartComponent,
  ],
  templateUrl: './month-wise-revenue.component.html',
  styleUrl: './month-wise-revenue.component.scss',
})
export class MonthWiseRevenueComponent {}
