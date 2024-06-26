import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges, AfterViewInit
} from '@angular/core';
import {ignoreElements} from "rxjs";

@Directive({
  selector: '[appScrollByButton]',
  standalone: true
})
export class ScrollByButtonDirective implements OnInit, OnChanges, AfterViewInit{
  @Input() rightButtonClicked = false;
  @Input() leftButtonClicked = false;
  @Output() isVisible: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  constructor(private el: ElementRef) {
  }

  ngOnInit(): void {
    this.detectThatElementIsScrollableOrNot();
  }

  ngAfterViewInit() {
    this.detectThatElementIsScrollableOrNot();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.rightButtonClicked){
      this.scrollElementToRightEnd();
    }
    if(this.leftButtonClicked){
      this.scrollElementToLeftEnd();
    }
  }
  scrollElementToRightEnd(){
    this.el.nativeElement.scrollLeft = this.el.nativeElement.scrollWidth;
  }
  scrollElementToLeftEnd(){
    this.el.nativeElement.scrollLeft = 0;
  }

  private detectThatElementIsScrollableOrNot() {
    this.isVisible.emit(this.el.nativeElement.scrollWidth > this.el.nativeElement.clientWidth);
  }
  @HostListener('window:resize') onResize(){
    this.detectThatElementIsScrollableOrNot();
  }
}
