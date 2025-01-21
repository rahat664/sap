import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { GetOutsideModalClickDirective } from '../../directive/get-outside-modal-click.directive';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { DriverEditSharedService } from '../../../pages/profiles/services/driver-edit-shared.service';

@Component({
  selector: 'app-check-list-popup',
  imports: [GetOutsideModalClickDirective, NgIf],
  templateUrl: './check-list-popup.component.html',
  styleUrl: './check-list-popup.component.scss',
})
export class CheckListPopupComponent implements OnChanges, OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() isModalClosed: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  private subs: Subscription;

  constructor(private sharedDriverEditService: DriverEditSharedService) {}

  closeModal() {
    this.isOpen = false;
    this.isModalClosed.emit(true);
  }

  ngOnChanges() {}

  ngOnInit(): void {
    this.subs = this.sharedDriverEditService.isUploadPopupOpen.subscribe(
      (res: any) => {
        this.isOpen = res;
      }
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onClick($event: boolean) {
    if ($event) {
      this.isModalClosed.emit(true);
      this.isOpen = false;
    }
  }
}
