import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appGetOutsideModalClick]',
  standalone: true
})
export class GetOutsideModalClickDirective {
  @Output() clickOutside = new EventEmitter<void>(false);

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickOutside.emit(true);
    }
  }

}
