import { Component, Input } from '@angular/core';
import { SessionModel } from '../../models/session.model';
import { DatePipe, DecimalPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-session-bid-details',
  imports: [DatePipe, DecimalPipe, NgForOf],
  templateUrl: './session-bid-details.component.html',
  styleUrl: './session-bid-details.component.scss',
})
export class SessionBidDetailsComponent {
  @Input() sessionBid: SessionModel = {} as SessionModel;

  editBid(bid) {
    
  }

  acceptBid(bid) {
    
  }
}
