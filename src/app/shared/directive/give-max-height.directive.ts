import {
  AfterContentInit,
  AfterViewChecked,
  Directive,
  ElementRef,
  EventEmitter,
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
}
