import {AfterViewChecked, Directive, ElementRef, EventEmitter, OnInit, Output} from '@angular/core';

@Directive({
  selector: '[appGetElementHeight]',
  standalone: true
})
export class GetElementHeightDirective implements OnInit, AfterViewChecked{

  @Output() height: EventEmitter<any> = new EventEmitter<any>();

  constructor(private el: ElementRef) {

  }

  ngOnInit(): void {
    this.height.emit(this.el.nativeElement.offsetHeight +  'px');
  }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      this.height.emit(this.el.nativeElement.offsetHeight +  'px');
    }, 0);
  }


}
