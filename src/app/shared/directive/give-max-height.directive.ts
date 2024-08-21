import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appGiveMaxHeight]',
})
export class GiveMaxHeightDirective implements OnInit, OnDestroy {
  @Input() anotherItemsHeight = '0px';
  @Input() totalPage: number = 0;
  @Output() elementHeight: EventEmitter<string> = new EventEmitter<string>();
  @Output() inBottomEnd: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );

  private topBarHeight = '110px';
  private mutationObserver: MutationObserver;

  constructor(private el: ElementRef) {
    this.mutationObserver = new MutationObserver(() => {
      this.setMaxHeight();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.setMaxHeight();
    }, 1000);

    this.observeDOMChanges();
  }

  ngOnDestroy(): void {
    this.mutationObserver.disconnect();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.setMaxHeight();
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    const target = event.target;
    if (
      target.offsetHeight + target.scrollTop >=
      target.scrollHeight - (this.totalPage + 30)
    ) {
        this.inBottomEnd.emit(true);
    } else {
      this.inBottomEnd.emit(false);
    }
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
    const maxHeight = `calc(100vh - ${this.anotherItemsHeight} - ${this.topBarHeight})`;
    this.el.nativeElement.style.maxHeight = maxHeight;
    this.elementHeight.emit(maxHeight);
  }
}
