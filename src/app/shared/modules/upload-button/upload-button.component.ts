import { Component, Input } from '@angular/core';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-upload-button',
  standalone: true,
  imports: [NgIf, NgClass, NgOptimizedImage],
  templateUrl: './upload-button.component.html',
  styleUrl: './upload-button.component.scss',
})
export class UploadButtonComponent {
  @Input() icon: string;
  @Input() buttonText: string;
  @Input() file = false;
  @Input() isIconButton = true;
  @Input() buttonColor: string;
  @Input() isDisabled = false;
  @Input() textColor: string;
}
