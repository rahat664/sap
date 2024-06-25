import {AfterViewChecked, Directive, ElementRef, EventEmitter, HostListener, OnInit, Output} from '@angular/core';

@Directive({
  selector: '[appCheckTheHeightCrossMaxHeightOrNot]',
  standalone: true
})
export class CheckTheHeightCrossMaxHeightOrNotDirective implements OnInit{

  @Output() maxHeightCrossed: EventEmitter<boolean> = new EventEmitter<boolean>(false);


  constructor(private el:ElementRef) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight) {
        console.log('crossed max height');
        this.maxHeightCrossed.emit(true);
      } else {
        console.log('not crossed max height');
        this.maxHeightCrossed.emit(false);
      }
    }, 1000);
  }
  // ngAfterViewChecked(): void {
  //   setTimeout(() => {
  //     if (this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight) {
  //       console.log('crossed max height');
  //       this.maxHeightCrossed.emit(true);
  //     } else {
  //       console.log('not crossed max height');
  //       this.maxHeightCrossed.emit(false);
  //     }
  //   }, 0);
  // }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight) {
      console.log('crossed max height');
      this.maxHeightCrossed.emit(true);
    } else {
      console.log('not crossed max height');
      this.maxHeightCrossed.emit(false);
    }
  }

  @HostListener('window:reload', ['$event'])
  onReload(event: any) {
    if (this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight) {
      console.log('crossed max height');
      this.maxHeightCrossed.emit(true);
    } else {
      console.log('not crossed max height');
      this.maxHeightCrossed.emit(false);
    }
  }

}
