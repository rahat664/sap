import {AfterViewChecked, Directive, ElementRef, EventEmitter, HostListener, OnInit, Output} from '@angular/core';

@Directive({
  selector: '[appGetElementHeight]',
  standalone: true
})
export class GetElementHeightDirective implements OnInit{

  @Output() height: EventEmitter<any> = new EventEmitter<any>();

  constructor(private el: ElementRef) {

  }

  ngOnInit(): void {
    this.height.emit(this.el.nativeElement.offsetHeight +  'px');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.height.emit(this.el.nativeElement.offsetHeight +  'px');
  }


}
