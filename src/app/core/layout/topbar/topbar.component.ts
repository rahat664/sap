import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ToggleResponsiveService } from '../../../shared/services/toggle-responsive-services/toggle-responsive.service';
import { AuthService } from '../../../pages/auth/services/auth.service';
import { TripService } from '../../../pages/trip-list/services/trip.service';
import { ImagePipe } from '../../../shared/pipes/image.pipe';
import { RouterLink } from '@angular/router';
import { GetOutsideModalClickDirective } from '../../../shared/directive/get-outside-modal-click.directive';
import { DriverEditSharedService } from '../../../pages/profiles/services/driver-edit-shared.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    NgOptimizedImage,
    CommonModule,
    ImagePipe,
    RouterLink,
    GetOutsideModalClickDirective,
    MatTooltip,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit {
  isSideBarOpen = false;
  isProfileOpened = false;
  searchSuggestions: any[] = [];
  isSearchedMenuOpened = false;
  name: string;
  image: string;

  constructor(
    private toggleMobileViewService: ToggleResponsiveService,
    private auth: AuthService,
    private trip: TripService,
    private shared: DriverEditSharedService
  ) {}

  ngOnInit(): void {
    this.name = localStorage.getItem('name');
    this.image = localStorage.getItem('image');
    this.toggleMobileViewService.isSidebarOpen.subscribe(value => {
      this.isSideBarOpen = value;
    });
  }

  toggleMobileSideBar() {
    this.isSideBarOpen = !this.isSideBarOpen;
    this.toggleMobileViewService.isSidebarOpen.next(this.isSideBarOpen);
  }

  onClickSearchOnMobile() {
    this.isSideBarOpen = true;
    this.toggleMobileViewService.isSidebarOpen.next(this.isSideBarOpen);
  }

  onClickLogOut() {
    this.auth.logout();
    this.isProfileOpened = false;
    this.shared.closeInputSelect.next(false);
  }

  onSearch($event: any) {
    const search = $event.target.value;
    if (search?.length > 0) {
      this.searchSuggestions = [];
      this.trip.getTripSuggestions(search).subscribe({
        next: (response: any) => {
          this.searchSuggestions = response;
          this.isSearchedMenuOpened = this.searchSuggestions?.length !== 0;
        },
      });
    } else {
      this.searchSuggestions = [];
      this.isSearchedMenuOpened = false;
    }
  }

  onClickLogo() {
    this.shared.closeInputSelect.next(false);
  }

  protected readonly environment = environment;
}
