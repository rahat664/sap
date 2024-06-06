import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-upload-button',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './upload-button.component.html',
  styleUrl: './upload-button.component.scss'
})
export class UploadButtonComponent {
  @Input() icon: string;
  @Input() buttonText: string;
  @Input() file: boolean = false;
  @Input() isIconButton: boolean = true;
  @Input() buttonColor: string = 'custom-gradient';
}
