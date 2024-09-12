import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appInputAutoFocus]',
  standalone: true,
})
export class InputAutoFocusDirective {
  @Input() idName: string;

  constructor(private el: ElementRef<any>) {}

  ngAfterViewInit() {
    if (this.el.nativeElement.id === this.idName) {
      this.el.nativeElement.focus();
    }
  }

  ngOnChanges() {
    if (this.el.nativeElement.id === this.idName) {
      this.el.nativeElement.focus();
    }
  }
}
