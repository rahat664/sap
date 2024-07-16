import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToggleResponsiveService } from '../../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  currentYear: number = new Date().getFullYear();

  constructor(
    private mobileViewService: ToggleResponsiveService,
    private router: Router
  ) {}

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
    this.clearSelectedTemplate();
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, false);
  }

  clearSelectedTemplate() {
    localStorage.removeItem('selectedTemplate');
  }
}
