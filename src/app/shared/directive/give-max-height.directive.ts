import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appGiveMaxHeight]',
})
export class GiveMaxHeightDirective {
  @Input() anotherItemsHeight = '0px';
  @Input() totalPage: number = 0;
  @Output() elementHeight: EventEmitter<string> = new EventEmitter<string>();
  @Output() inBottomEnd: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  private topBarHeight = '110px';

  constructor(private el: ElementRef) {
  }

  ngOnInit(): void {
    this.setMaxHeight();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.setMaxHeight();
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    // Detect if the user has scrolled to the bottom of the div
    const target = event.target;
    if (target.offsetHeight + target.scrollTop >= target.scrollHeight - (this.totalPage + 30)) {
      this.inBottomEnd.emit(true);
    }
  }

  // detect route change
  @HostListener('window:popstate', ['$event']) onPopState(event: any) {
    this.setMaxHeight();
  }

  // detect dom change for every dom change
  @HostListener('document:DOMSubtreeModified', ['$event']) onDomChange(event: any) {
    this.setMaxHeight();
  }

  // detect removal of dom element
  @HostListener('document:DOMNodeRemoved', ['$event']) onDomNodeRemoved(event: any) {
    // delay for 1 second to wait for the dom to be removed
    setTimeout(() => {
      this.setMaxHeight();
    }, 100);
  }


  private setMaxHeight(): void {
    const maxHeight = `calc(100vh - ${this.anotherItemsHeight} - ${this.topBarHeight})`;
    this.el.nativeElement.style.maxHeight = maxHeight;
    this.elementHeight.emit(maxHeight);
  }
}
