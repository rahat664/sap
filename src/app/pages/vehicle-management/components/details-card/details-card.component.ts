import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-details-card',
  imports: [NgIf, DatePipe],
  templateUrl: './details-card.component.html',
  styleUrl: './details-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsCardComponent {
  @Output() reply = new EventEmitter<string>();
  @Input() actionButtonText: string = 'Action';
  @Input() title: string = 'Title';
  @Input() details: any = {};
  @Input() bgColorOfDetails: string = '#ffffff';
  @Input() textColorOfDetails: string = '#000000';
  @Input() cardBackgroundColor: string = '#f5f5f5';
  @Input() imageUrl: string = 'images/user.png';

  actionButtonReply() {
    this.reply.emit(this.actionButtonText);
  }
}
