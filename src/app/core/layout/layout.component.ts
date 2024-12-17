import {Component, HostListener} from '@angular/core';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleResponsiveService } from '../../shared/services/toggle-responsive-services/toggle-responsive.service';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [TopbarComponent, SidebarComponent, NgIf],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  isSideBarOpen: boolean;
  constructor(private mobileViewService: ToggleResponsiveService) {
    this.checkScreenSize(window.innerWidth);
  }

  ngOnInit() {
    const sideBarMargin = document.getElementById('sidebarMargin');
    setTimeout(() => {
      sideBarMargin.classList.remove('slide-right');
    }, 0);
    this.mobileViewService.isSidebarOpen.subscribe(value => {
      this.isSideBarOpen = !value;
      if (value) {
        sideBarMargin.classList.remove('slide-right');
        sideBarMargin.classList.add('slide-left');
        sideBarMargin.style.marginLeft = '0px';
      } else {
        // skip for tablet and mobile
        if (window.innerWidth > 768) {
          sideBarMargin.style.marginLeft = '19rem';
          sideBarMargin.classList.add('slide-right');
          sideBarMargin.classList.remove('slide-left');
        }
      }
    });
  }
  @HostListener('window:resize', ['$event']) onResize(event) {
    this.checkScreenSize(event.target.innerWidth);
  }

  private checkScreenSize(innerWidth: number) {
    console.log(innerWidth);
    if (innerWidth <= 768) {
      this.mobileViewService.isSidebarOpen.next(true);
    } else {
      this.mobileViewService.isSidebarOpen.next(false);
    }
  }
}
