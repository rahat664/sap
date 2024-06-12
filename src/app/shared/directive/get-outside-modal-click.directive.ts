import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';
import {DriverEditSharedService} from "../../pages/profiles/services/driver-edit-shared.service";

@Directive({
  selector: '[appGetOutsideModalClick]',
  standalone: true
})
export class GetOutsideModalClickDirective {
  @Output() clickOutside = new EventEmitter<boolean>(false);

  constructor(private elementRef: ElementRef, private shared: DriverEditSharedService) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    console.log('clickedInside', clickedInside)
    if (!clickedInside) {
      this.clickOutside.emit(true);
    }
  }

  ngOnInit() {
    this.shared.isUploadPopupOpen.subscribe((data) => {
      console.log('data', data)
    });
  }

}
