import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  bidUrl = `${environment.bidUrl}`;
  constructor(private http: HttpClient) { }

  getSessionBids(body: any, meta: any) {
    return this.http.post(
      `${this.bidUrl}/session/get-list`,
      {
        body,
        meta
      }
    )
  }

  getSessionBidById(sessionId: number) {
    return this.http.get(
      `${this.bidUrl}/session/get-by-id/${sessionId}`
    );
  }
  updateSessionBid(body: any) {
    return this.http.put(
      `${this.bidUrl}/session/update`,
      body
    );
  }

  getBids(body: any, meta: any) {
    return this.http.post(
      `${this.bidUrl}/bid/get-list`,
      {
        body,
        meta
      }
    )
  }

  getBidById(bidId: number) {
    return this.http.get(
      `${this.bidUrl}/bid/get-by-id/${bidId}`
    );
  }

  updateBid(body: any) {
    return this.http.put(
      `${this.bidUrl}/bid/update`,
      body
    );
  }

  acceptBid(body: any) {
    return this.http.post(
      `${this.bidUrl}/bid/accept-bid`,
      body
    );
  }
}
