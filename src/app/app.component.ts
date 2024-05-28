import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {LayoutComponent} from "./core/layout/layout.component";
import {initFlowbite} from "flowbite";
import {TopbarComponent} from "./core/layout/topbar/topbar.component";
import {CommonModule} from "@angular/common";
import {environment} from "../environments/environment";
import {AuthService} from "./pages/auth/services/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent, TopbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'snz-web';

  constructor(private router: Router, private auth: AuthService) {
  }

  ngOnInit(): void {
    initFlowbite();
    console.log(environment.userUrl);
  }

  isLoginPage() {
    if (this.auth.isLoggedIn()) {
      return this.router.url === '/auth/login';
    } else {
      return true;
    }
  }
}
