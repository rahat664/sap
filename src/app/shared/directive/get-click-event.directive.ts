import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Directive({
  selector: '[appGetClickEvent]',
  standalone: true
})
export class GetClickEventDirective {


  @Output() clickedElement: EventEmitter<boolean> = new EventEmitter();
  elementClicked: boolean = false;

  @HostListener('click', ['$event'])
  onClick(event: any) {
    // get event by specific element
    if (event.target.id === 'customInputSelect') {
      this.clickedElement.emit(this.elementClicked = !this.elementClicked);
    } else {
      this.clickedElement.emit(false);
    }
  }

  constructor(private el: ElementRef) {
  }

}
