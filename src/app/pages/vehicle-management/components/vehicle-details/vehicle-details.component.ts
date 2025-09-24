import { Component } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-vehicle-details',
  imports: [MatAnchor, MatButton, MatTab, MatTabGroup],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss',
})
export class VehicleDetailsComponent {
  goBack() {}

  openEditVehicleDialog() {}
}
