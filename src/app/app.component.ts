import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
  title = 'snz-web';
  isOpen: boolean;
  map: google.maps.Map;

  constructor(
    private router: Router,
    private auth: AuthService,
    private imageGalleryService: ImageGalleryService,
    private handleToaster: HandleToastrService,
    private geoLocation: GeolocationService,
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
        return this.imageGalleryService.setCurrentImage(target.getAttribute('src'));
      }
    }
  }

  ngOnInit(): void {
    initFlowbite();
    this.addMapScript();
  }

  isLoginPage() {
    if (this.auth.isLoggedIn()) {
      return this.router.url === '/auth/login';
    } else {
      return true;
    }
  }

  private addMapScript() {
    this.geoLocation.loadGoogleMapsApi().then(() => {
      this.geoLocation.getCurrentPosition().then(coords => {
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: coords.latitude, lng: coords.longitude },
          zoom: 8,
        });
      });
    });
  }
}
