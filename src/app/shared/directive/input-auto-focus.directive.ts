import { ChangeDetectorRef, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appInputAutoFocus]',
  standalone: true,
})
export class InputAutoFocusDirective {
  @Input() idName: string;

  constructor(
    private el: ElementRef<any>,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnChanges() {
    if (this.el.nativeElement.id === this.idName) {
      this.el.nativeElement.focus();
    }
  }
}
