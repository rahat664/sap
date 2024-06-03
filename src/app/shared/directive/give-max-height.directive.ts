import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[appGiveMaxHeight]',
  standalone: true
})
export class GiveMaxHeightDirective {
  @Input() anotherItemsHeight: string = '0px';
  topBarHeight: string = '130px';

  constructor(private el:ElementRef) { }

  ngOnInit(): void {
    this.el.nativeElement.style.maxHeight = 'calc(100vh - ' + this.anotherItemsHeight + ' - ' + this.topBarHeight + ')';
  }
}
