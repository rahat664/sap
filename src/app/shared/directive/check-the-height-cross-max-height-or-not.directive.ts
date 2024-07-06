import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appCheckTheHeightCrossMaxHeightOrNot]',
  standalone: true,
})
export class CheckTheHeightCrossMaxHeightOrNotDirective {
  @Output() maxHeightCrossed: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  private checkHeight() {
    const isMaxHeightCrossed = this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight;
    this.maxHeightCrossed.emit(isMaxHeightCrossed);
  }

  constructor(private el: ElementRef) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.checkHeight();
    }, 1000); // Delayed check after component initialization
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkHeight();
  }

  @HostListener('window:reload', ['$event'])
  onReload() {
    this.checkHeight();
  }

  // detect route change
  @HostListener('window:popstate', ['$event']) onPopState(event: any) {
    this.checkHeight();
  }

  // detect dom change
  @HostListener('document:DOMSubtreeModified', ['$event']) onDomChange(event: any) {
    this.checkHeight();
  }
}
