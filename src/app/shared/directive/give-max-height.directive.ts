import {
  AfterContentInit,
  AfterViewChecked,
  Directive,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Directive({
  selector: '[appGiveMaxHeight]',
  standalone: true
})
export class GiveMaxHeightDirective implements OnInit, AfterViewChecked{
  @Input() anotherItemsHeight: string = '0px';
  @Output() elementHeight: EventEmitter<any> = new EventEmitter<any>();
  topBarHeight: string = '110px';
  @Output() inBottomEnd: EventEmitter<boolean> = new EventEmitter<any>(false);
  @Input() totalPage: number;

  constructor(private el:ElementRef) { }

  ngOnInit(): void {
    this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
    this.elementHeight.emit(this.el.nativeElement.style.maxHeight);
  }
  ngAfterViewChecked(): void {
    setTimeout(() => {
      this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
      this.elementHeight.emit(this.el.nativeElement.style.maxHeight);
    }, 0);
  }

  @HostListener('scroll', ['$event']) onScroll(event: any) {
    //detect that the user has scrolled to the bottom of the div
    if (event.target.offsetHeight + event.target.scrollTop >= (event.target.scrollHeight - (this.totalPage + 5))) {
      this.inBottomEnd.emit(true);
    }
  }
}
