import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
})
export class ProfilesComponent {}
