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
import { debounceTime } from 'rxjs';
import { environment } from '../environments/environment';

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

  constructor(
    private router: Router,
    private auth: AuthService,
    private imageGalleryService: ImageGalleryService,
    private handleToaster: HandleToastrService,
  ) {}

  @HostListener('click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // dont preview if IMG class is notPreview
    if (target.tagName === 'IMG' && !target.classList.contains('notPreview')) {
      console.log('image clicked', target.getAttribute('src'));
      this.imageGalleryService.setCurrentImage(target.getAttribute('src'));
      this.isOpen = true;
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
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.API_KEY}&libraries=marker`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
}
