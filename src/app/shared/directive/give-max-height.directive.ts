import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input, numberAttribute,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TripService } from '../../pages/trip-list/services/trip.service';
import { TripData } from '../../pages/manage-trip/model/trip.details.model';
import { SessionModel } from '../../pages/manage-bid/models/session.model';

@Directive({
  standalone: true,
  selector: '[appGiveMaxHeight]',
})
export class GiveMaxHeightDirective implements OnInit, OnDestroy {
  @Input() anotherItemsHeight = '0px';
  @Input({ transform: numberAttribute }) totalPage: number = 0;
  @Output() elementHeight: EventEmitter<string> = new EventEmitter<string>();
  @Input() anotherStatusCalled: boolean = false;
  @Output() inBottomEnd: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  private topBarHeight = '110px';
  private mutationObserver: MutationObserver;
  private debounceTimer: any;

  constructor(
    private el: ElementRef,
    private trip: TripService
  ) {
    this.mutationObserver = new MutationObserver(() => {
      this.setMaxHeight();
      this.setMinHeight();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.setMaxHeight();
    }, 1000);

    this.observeDOMChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.anotherStatusCalled) {
      this.inBottomEnd.emit(false);
    }
  }

  ngOnDestroy(): void {
    this.mutationObserver.disconnect();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.setMaxHeight();
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.checkScrollPosition(event);
    }, 10); // Adjust the delay as needed
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    setTimeout(() => {
      this.setMaxHeight();
    }, 1000);
  }

  private observeDOMChanges(): void {
    this.mutationObserver.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  private setMaxHeight(): void {
    const maxHeight = `calc(100vh - ${this.anotherItemsHeight} - ${this.topBarHeight} - ${this.isMobileDevice() ? '40px' : '0px'}) `;
    this.el.nativeElement.style.maxHeight = maxHeight;
    this.elementHeight.emit(maxHeight);
    // if div contains table, then set border
    if (this.el.nativeElement.querySelector('table')) {
      this.el.nativeElement.style.border = '1px solid #A1D5DE';
    }
  }

  private setMinHeight(): void {
    const minHeight = `calc(100vh - ${this.anotherItemsHeight} - ${this.topBarHeight} - ${this.isMobileDevice() ? '40px' : '0px'}) `;
    this.el.nativeElement.style.minHeight = minHeight;

  }

  isMobileDevice() {
    return localStorage.getItem('isMobileDevice') === 'true';
  }


  private checkScrollPosition(event: any): void {
    this.anotherStatusCalled = false;
    const target = event.target;
    const isAtBottom =
      target.offsetHeight + target.scrollTop >=
      target.scrollHeight - this.totalPage;
    this.inBottomEnd.emit(isAtBottom);
  }
}
