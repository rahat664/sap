import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {DriverEditSharedService} from "../../../pages/profiles/services/driver-edit-shared.service";
import {Subscription} from "rxjs";
import {GetOutsideModalClickDirective} from "../../directive/get-outside-modal-click.directive";

@Component({
  selector: 'app-create-popup',
  standalone: true,
  imports: [
    NgIf,
    GetOutsideModalClickDirective
  ],
  templateUrl: './create-popup.component.html',
  styleUrl: './create-popup.component.scss'
})
export class CreatePopupComponent {
  @Input() isOpen: boolean = false;
  @Output() isModalClosed: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  private subs: Subscription;

  constructor(private sharedDriverEditService: DriverEditSharedService) {

  }

  closeModal() {
    this.isOpen = false;
    this.isModalClosed.emit(true);
  }
  ngOnInit(): void {
     this.subs = this.sharedDriverEditService.isUploadPopupOpen.subscribe((res: any) => {
      this.isOpen = res;
    });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
