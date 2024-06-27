import {
  AfterViewChecked,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appCheckTheHeightCrossMaxHeightOrNot]',
  standalone: true,
})
export class CheckTheHeightCrossMaxHeightOrNotDirective implements OnInit {
  @Output() maxHeightCrossed: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  private Interval: number;

  constructor(
    private el: ElementRef,
    private ref: ChangeDetectorRef
  ) {
  }

  ngOnDestroy(): void {
    clearInterval(this.Interval);
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (
        this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight
      ) {
        this.maxHeightCrossed.emit(true);
      } else {
        this.maxHeightCrossed.emit(false);
      }
    }, 1000);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (
      this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight
    ) {
      this.maxHeightCrossed.emit(true);
    } else {
      this.maxHeightCrossed.emit(false);
    }
  }

  @HostListener('window:reload', ['$event'])
  onReload(event: any) {
    if (
      this.el.nativeElement.scrollHeight > this.el.nativeElement.clientHeight
    ) {
      this.maxHeightCrossed.emit(true);
    } else {
      this.maxHeightCrossed.emit(false);
    }
  }
}
