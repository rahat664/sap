import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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

  @ViewChild('sideBar') myDiv!: ElementRef;

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.myDiv.nativeElement.classList.remove('slide-right');
    }, 1);
    this.subs = this.mobileViewService.isSidebarOpen.subscribe(value => {
      if (value) {
        this.myDiv.nativeElement.classList.remove('slide-right');
        this.myDiv.nativeElement.classList.add('slide-left');
        setTimeout(() => {
          this.willShow = value;
        }, 500);
      } else {
        this.willShow = value;
        setTimeout(() => {
          this.myDiv.nativeElement.classList.add('slide-right');
          this.myDiv.nativeElement.classList.remove('slide-left');
        }, 0);
      }
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
    if(this.isAdmin()) {
      localStorage.removeItem('customerCode');
      localStorage.removeItem('selectedTemplate');
      localStorage.removeItem('backFromTemplateEditOrUpdate');
      localStorage.removeItem('selectedCustomer');
    }
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }

  isCustomerAdmin() {
    return localStorage.getItem('role').includes('ROLE_CUSTOMER_ADMIN');
  }
}
