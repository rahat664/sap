import { Component } from '@angular/core';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleResponsiveService } from '../../shared/services/toggle-responsive-services/toggle-responsive.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [TopbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  constructor(private mobileViewService: ToggleResponsiveService) {}

  ngOnInit() {
    const sideBarMargin = document.getElementById('sidebarMargin');
    setTimeout(() => {
      sideBarMargin.classList.remove('slide-right');
    }, 0);
    this.mobileViewService.isSidebarOpen.subscribe(value => {
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
}
