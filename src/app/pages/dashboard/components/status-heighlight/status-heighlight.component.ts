import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusCardComponent } from './status-card/status-card.component';

@Component({
  selector: 'app-status-heighlight',
  standalone: true,
  imports: [
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    StatusCardComponent,
  ],
  templateUrl: './status-heighlight.component.html',
  styleUrl: './status-heighlight.component.scss',
})
export class StatusHeighlightComponent {}
