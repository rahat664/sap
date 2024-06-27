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
    private ref: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }

  ngAfterViewChecked() {
    setTimeout(() => {
      this.height.emit(this.el.nativeElement.offsetHeight + 'px');
    }, 0);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.height.emit(this.el.nativeElement.offsetHeight + 'px');
  }
}
