import {
  AfterContentInit,
  AfterViewChecked, ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appGiveMaxHeight]',
  standalone: true
})
export class GiveMaxHeightDirective implements OnInit{
  @Input() anotherItemsHeight = '0px';
  @Output() elementHeight: EventEmitter<any> = new EventEmitter<any>();
  topBarHeight = '110px';
  @Output() inBottomEnd: EventEmitter<boolean> = new EventEmitter<any>(false);
  @Input() totalPage: number;

  constructor(private el: ElementRef, private ref: ChangeDetectorRef) {
    ref.detach();
    setInterval(() => {
      this.ref.detectChanges();
    }, 1000);
  }

  ngOnInit(): void {
    this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
    this.elementHeight.emit(this.el.nativeElement.style.maxHeight);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
    this.elementHeight.emit(this.el.nativeElement.style.maxHeight);
  }

  ngAfterViewChecked() {
    setTimeout(() => {
      this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
      this.elementHeight.emit(this.el.nativeElement.style.maxHeight);
    }, 0);
  }

  @HostListener('scroll', ['$event']) onScroll(event: any) {
    //detect that the user has scrolled to the bottom of the div
    if (event.target.offsetHeight + event.target.scrollTop >= (event.target.scrollHeight - (this.totalPage + 30))) {
      this.inBottomEnd.emit(true);
    }
  }
}
