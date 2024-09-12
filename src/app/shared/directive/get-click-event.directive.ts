import {
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DriverEditSharedService } from '../../pages/profiles/services/driver-edit-shared.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appGetClickEvent]',
  standalone: true,
})
export class GetClickEventDirective implements OnInit, OnDestroy {
  @Output() clickedElement = new EventEmitter<boolean>();
  private subs = new Subscription();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (
      event.target &&
      (event.target as HTMLElement).id === 'customInputSelect'
    ) {
      this.shared.closeInputSelect.next(true);
    } else {
      this.clickedElement.emit(false);
    }
  }

  constructor(private shared: DriverEditSharedService) {}

  ngOnInit() {
    this.subs = this.shared.closeInputSelect.subscribe(data => {
      this.clickedElement.emit(data);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
