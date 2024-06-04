import {AfterContentInit, AfterViewChecked, Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appGiveMaxHeight]',
  standalone: true
})
export class GiveMaxHeightDirective implements OnInit, AfterViewChecked{
  @Input() anotherItemsHeight: string = '0px';
  topBarHeight: string = '110px';

  constructor(private el:ElementRef) { }

  ngOnInit(): void {
    this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
  }
  ngAfterViewChecked(): void {
    setTimeout(() => {
      this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
    }, 0);
  }
}
