import { Component } from '@angular/core';
import {TopbarComponent} from "./topbar/topbar.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    TopbarComponent,
    SidebarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
