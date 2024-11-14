import { Component } from '@angular/core';
import {
  GlobalImageUploadComponent
} from '../../../../shared/modules/global-image-upload/global-image-upload.component';

@Component({
  selector: 'app-challan-image-upload',
  standalone: true,
  imports: [GlobalImageUploadComponent],
  templateUrl: './challan-image-upload.component.html',
  styleUrl: './challan-image-upload.component.scss',
})
export class ChallanImageUploadComponent {}
