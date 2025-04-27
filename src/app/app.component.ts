import {
  Component,
  HostListener,
  inject,
  OnInit,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';
import { AuthService } from './pages/auth/services/auth.service';
import { ImageGalleryService } from './shared/services/image-gallery/image-gallery.service';
import { ImageGalleryComponent } from './shared/modules/image-gallery/image-gallery.component';
import { HandleToastrService } from './shared/services/handle-toastr/handle-toastr.service';
import { GeolocationService } from './shared/services/location/geolocation.service';
import { filter } from 'rxjs';
import { DriverEditSharedService } from './pages/profiles/services/driver-edit-shared.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadingService } from './shared/services/loading/loading.service';
import { ToggleResponsiveService } from './shared/services/toggle-responsive-services/toggle-responsive.service';

/**
 * The main application component.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  private focusListener: () => void;
  title = 'snz-web';
  isOpen: boolean;
  map: google.maps.Map;
  isLoading = this.loadingService.loading$;

  fallbackImage = 'assets/images/placehoder.webp';

  /**
   * Constructs the AppComponent.
   * @param router The Angular Router.
   * @param auth The AuthService for authentication.
   * @param imageGalleryService The ImageGalleryService for handling image galleries.
   * @param handleToaster The HandleToastrService for displaying toast notifications.
   * @param geoLocation The GeolocationService for handling geolocation.
   * @param shared The DriverEditSharedService for shared driver edit functionality.
   * @param renderer The Angular Renderer2 for DOM manipulation.
   * @param loadingService The LoadingService for handling loading states.
   */
  constructor(
    private router: Router,
    private auth: AuthService,
    private imageGalleryService: ImageGalleryService,
    private handleToaster: HandleToastrService,
    private geoLocation: GeolocationService,
    private shared: DriverEditSharedService,
    private renderer: Renderer2,
    private loadingService: LoadingService,
    private mobileViewServices: ToggleResponsiveService,
  ) {
    this.setUrlWiseFavicon()
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }
    });
  }

  /**
   * Handles document click events.
   * @param event The mouse event.
   */
  @HostListener('click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // dont preview if IMG class is notPreview
    if (target.tagName === 'IMG' && !target.classList.contains('notPreview')) {
      if (target.getAttribute('src').includes('map')) {
        this.isOpen = false;
        return;
      } else {
        this.dialog.open(ImageGalleryComponent, {});
        return this.imageGalleryService.setCurrentImage(
          target.getAttribute('src')
        );
      }
    }
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    initFlowbite();
    this.handleRouter();
    this.loadGoogleMapsScript();
    this.geoLocation.getCurrentPosition();
    this.setCurrentLocationInStorage();
    this.checkInputListener();
    this.checkWhichRouteWeAreOn();
    this.detectIsMobileDevice();
  }

  /**
   * Checks if the current page is the login page.
   * @returns True if the current page is the login page, otherwise false.
   */
  isLoginPage() {
    if (this.auth.isLoggedIn()) {
      return this.router.url === '/auth/login';
    } else {
      return true;
    }
  }

  /**
   * Checks if the current page is the about page.
   * @returns True if the current page is the about page, otherwise false.
   */
  isAboutPage() {
    return this.router.url === '/about-us';
  }

  /**
   * Handles router events.
   */
  private handleRouter() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.shared.closeInputSelect.next(false);
      });
  }

  /**
   * Loads the Google Maps script.
   */
  private loadGoogleMapsScript() {
    this.geoLocation.loadGoogleMapsScript().then(() => {
      this.geoLocation.getCurrentPosition().then(coords => {});
    });
  }

  /**
   * Sets the current location in local storage.
   */
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

  // set the url wise favicon
  setUrlWiseFavicon() {
    // link tag for favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    // get the current url
    const url = window.location.href;
    // check if the url contains the word support
    if (url.includes('ecoflit')) {
      link.href = 'assets/logo/eco.ico';
    } else {
      link.href = 'assets/logo/snz.ico';
    }

    // append link tag to head
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  /**
   * Cleans up resources when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.focusListener) {
      this.focusListener();
    }
  }

  /**
   * Checks input listeners and sets default values for number inputs.
   */
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

  /**
   * Checks if the current page is the support page.
   * @returns True if the current page is the support page, otherwise false.
   */
  isSupportPage() {
    return this.router.url === '/support';
  }

  private checkWhichRouteWeAreOn() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url !== '/profile/transporter/add' && this.router.url !== '/profile/document-upload' && !(this.router.url.startsWith('/profile/transporter') && this.router.url.endsWith('/details'))) {
          localStorage.removeItem('Transporter Image');
          localStorage.removeItem('NID Front');
          localStorage.removeItem('NID Back');
          localStorage.removeItem('Trade License');
          localStorage.removeItem('Agreement');
          localStorage.removeItem('Other');
          localStorage.removeItem('transporterPayload');
          localStorage.removeItem('isFromDocumentSave');
          localStorage.removeItem('tradelicenseexpiry');
          localStorage.removeItem('agreementexpiry');
        }
      }
    });
  }

  private detectIsMobileDevice() {
    // Check if the user agent string contains 'Mobi'
    const isMobile = /Mobi/.test(navigator.userAgent);
    // Check if the user agent string contains 'Android'
    const isAndroid = /Android/.test(navigator.userAgent);
    // Check if the user agent string contains 'iPhone'
    const isiPhone = /iPhone/.test(navigator.userAgent);
    //if any of the upper condition is true then set the isMobileDevice to true and turn side bar to false
    if (isMobile || isAndroid || isiPhone) {
      this.mobileViewServices.isMobileDevice.next(true)
      localStorage.setItem('isMobileDevice', 'true');
    } else {
      localStorage.setItem('isMobileDevice', 'false');
      this.mobileViewServices.isMobileDevice.next(false)
    }
  }
}
