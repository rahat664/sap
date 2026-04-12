import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'image',
  standalone: true,
})
export class ImagePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (value) {
      return value;
    } else {
      // Use lightweight, scalable SVG to avoid large intrinsic image warnings
      return 'assets/svg/user.svg';
    }
  }
}
