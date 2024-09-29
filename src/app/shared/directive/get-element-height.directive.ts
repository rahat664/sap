import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appGetElementHeight]',
  standalone: true,
})
export class GetElementHeightDirective implements OnInit, OnDestroy {
  @Output() height: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  private mutationObserver: MutationObserver;

  constructor(
    private el: ElementRef,
    private ref: ChangeDetectorRef
  ) {
    this.mutationObserver = new MutationObserver(() => {
      this.emitHeight();
    });
  }

  ngOnInit(): void {
    this.emitHeight();
    this.observeDOMChanges();
  }

  ngOnDestroy(): void {
    this.mutationObserver.disconnect();
  }

  private emitHeight(): void {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }

  private emitWidth(): void {
    this.width.emit(this.el.nativeElement.offsetWidth + 'px');
  }

  private observeDOMChanges(): void {
    this.mutationObserver.observe(this.el.nativeElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.emitHeight();
  }

  // detect route change
  @HostListener('window:popstate', ['$event']) onPopState(event: any) {
    this.emitHeight();
  }
}
