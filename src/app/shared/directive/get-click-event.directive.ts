import {Directive, ElementRef, EventEmitter, HostListener, Input, Output, OnInit, OnDestroy} from '@angular/core';
import {DriverEditSharedService} from "../../pages/profiles/services/driver-edit-shared.service";
import {Subscription} from "rxjs";

@Directive({
  selector: '[appGetClickEvent]',
  standalone: true
})
export class GetClickEventDirective implements OnInit, OnDestroy {


  @Output() clickedElement = new EventEmitter<boolean>();
  elementClicked = false;
  private subs: Subscription;

  @HostListener('click', ['$event'])
  onClick(event: any) {
    // get event by specific element
    if (event.target.id === 'customInputSelect') {
      this.clickedElement.emit(this.elementClicked = !this.elementClicked);
    }
  }

  constructor(private el: ElementRef, private shared: DriverEditSharedService) {
  }

  ngOnInit() {
    this.subs = this.shared.closeInputSelect.subscribe((data) => {
      this.elementClicked = data;
    });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
