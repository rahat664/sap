import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToggleResponsiveService } from '../../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GetOutsideModalClickDirective } from '../../../shared/directive/get-outside-modal-click.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    GetOutsideModalClickDirective,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  willShow = false;
  dropdownOpen = false;
  private subs: Subscription;
  constructor(private mobileViewService: ToggleResponsiveService) {}
  ngOnInit(): void {
    this.subs = this.mobileViewService.isSidebarOpen.subscribe(value => {
      this.willShow = value;
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onClickProfile() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
