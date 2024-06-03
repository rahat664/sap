import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appGetClickEvent]',
  standalone: true
})
export class GetClickEventDirective {

  @Output() clickedElement: EventEmitter<boolean> = new EventEmitter();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    this.clickedElement.emit(true);
  }

  constructor(private el: ElementRef) { }

}
