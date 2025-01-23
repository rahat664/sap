import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fallbackImage',
})
export class FallbackImagePipe implements PipeTransform {
  defaultFallback = 'assets/images/placeholder.webp';
  transform(value: any): unknown {
    if (!value || !this.isValidImageType(value)) {
      return this.defaultFallback;
    }
    return value;
  }

  private isValidImageType(imagePath: string): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    // if the image path includes above extensions, return true
    return validExtensions.some(ext => imagePath.includes(ext));
  }
}
