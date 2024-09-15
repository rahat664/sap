import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { initFlowbite } from 'flowbite';
import { TopbarComponent } from './core/layout/topbar/topbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './pages/auth/services/auth.service';
import { ImageGalleryService } from './shared/services/image-gallery/image-gallery.service';
import { ImageGalleryComponent } from './shared/modules/image-gallery/image-gallery.component';
import { ImagePopupComponent } from './shared/modal/image-popup/image-popup.component';
import { HandleToastrService } from './shared/services/handle-toastr/handle-toastr.service';
import { GeolocationService } from './shared/services/location/geolocation.service';
import { filter } from 'rxjs';
import { DriverEditSharedService } from './pages/profiles/services/driver-edit-shared.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LayoutComponent,
    TopbarComponent,
    CommonModule,
    ImageGalleryComponent,
    ImagePopupComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private focusListener: () => void;
  title = 'snz-web';
  isOpen: boolean;
  map: google.maps.Map;

  constructor(
    private router: Router,
    private auth: AuthService,
    private imageGalleryService: ImageGalleryService,
    private handleToaster: HandleToastrService,
    private geoLocation: GeolocationService,
    private shared: DriverEditSharedService,
    private renderer: Renderer2
  ) {}

  @HostListener('click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // dont preview if IMG class is notPreview
    if (target.tagName === 'IMG' && !target.classList.contains('notPreview')) {
      if (target.getAttribute('src').includes('map')) {
        this.isOpen = false;
        return;
      } else {
        this.isOpen = true;
        return this.imageGalleryService.setCurrentImage(
          target.getAttribute('src')
        );
      }
    }
  }

  ngOnInit(): void {
    initFlowbite();
    this.handleRouter();
    this.loadGoogleMapsScript();
    this.geoLocation.getCurrentPosition();
    this.setCurrentLocationInStorage();
    this.checkInputListener();
  }

  isLoginPage() {
    if (this.auth.isLoggedIn()) {
      return this.router.url === '/auth/login';
    } else {
      return true;
    }
  }

  private handleRouter() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.shared.closeInputSelect.next(false);
      });
  }

  private loadGoogleMapsScript() {
    this.geoLocation.loadGoogleMapsScript().then(() => {
      this.geoLocation.getCurrentPosition().then(coords => {});
    });
  }

  private setCurrentLocationInStorage() {
    if (localStorage.getItem('currentLocation') === null) {
      this.geoLocation.getCurrentPosition().then(coords => {
        localStorage.setItem(
          'currentLocation',
          JSON.stringify({
            lat: coords.latitude,
            lng: coords.longitude,
          })
        );
      });
    }
  }

  ngOnDestroy() {
    if (this.focusListener) {
      this.focusListener();
    }
  }

  private checkInputListener() {
    this.focusListener = this.renderer.listen('document', 'click', event => {
      // if the target is a number type turn off scrolling and add min max
      if (
        (event.target as HTMLElement).tagName === 'INPUT' &&
        (event.target as HTMLInputElement).type === 'number'
      ) {
        (event.target as HTMLInputElement).onwheel = (e: WheelEvent) => {
          e.preventDefault();
        };
        // add min max to input type number
        if ((event.target as HTMLInputElement).min === '') {
          (event.target as HTMLInputElement).min = '0';
        }
        if ((event.target as HTMLInputElement).max === '') {
          (event.target as HTMLInputElement).max =
            Number.MAX_SAFE_INTEGER.toString();
        }
      }
    });
  }
}
