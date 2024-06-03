import {Directive, ElementRef, EventEmitter, Output} from '@angular/core';

@Directive({
  selector: '[appGetElementHeight]',
  standalone: true
})
export class GetElementHeightDirective {

  @Output() height: EventEmitter<any> = new EventEmitter<any>();

  constructor(private el: ElementRef) {

  }

  ngOnInit(): void {
    this.height.emit(this.el.nativeElement.offsetHeight +  'px');
  }

}
