import {
  AfterViewChecked,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appGetElementHeight]',
  standalone: true,
})
export class GetElementHeightDirective implements OnInit {
  @Output() height: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private el: ElementRef,
    private ref: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }

  // detect route change
  @HostListener('window:popstate', ['$event']) onPopState(event: any) {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }

  // detect dom change
  @HostListener('document:DOMSubtreeModified', ['$event']) onDomChange(event: any) {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }

  // detect removal of dom element
  @HostListener('document:DOMNodeRemoved', ['$event']) onDomNodeRemoved(event: any) {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }

}
