import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appImageError]',
})
export class ImageErrorDirective {
  fallbackSrc = 'assets/images/placeholder.webp';

  constructor(private el: ElementRef) {}

  @HostListener('error') onError() {
    const element = this.el.nativeElement as HTMLImageElement;
    element.src = this.fallbackSrc; // Replace with fallback image
  }
}
