import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {ToggleResponsiveService} from "../../../shared/services/toggle-responsive-services/toggle-responsive.service";
import {AuthService} from "../../../pages/auth/services/auth.service";
import {TripService} from "../../../pages/trip-list/services/trip.service";

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    NgOptimizedImage,
    CommonModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit{
  isSideBarOpen: boolean = false;
  isProfileOpened: boolean = false;
  searchSuggestions: any[] = [];
  isSearchedMenuOpened: boolean = false;
  constructor(private toggleMobileViewService: ToggleResponsiveService,
              private auth: AuthService,
              private trip: TripService) { }

  ngOnInit(): void {
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
    this.auth.logout()
  }

  onSearch($event: any) {
    const search = $event.target.value;
    if(search.length > 0){
      this.searchSuggestions = [];
      this.trip.getTripSuggestions(search).subscribe({
        next: (response: any) => {
          this.searchSuggestions = response;
          this.isSearchedMenuOpened = this.searchSuggestions.length !== 0;
        }
      });
    } else {
      this.searchSuggestions = [];
      this.isSearchedMenuOpened = false;
    }

  }
}
