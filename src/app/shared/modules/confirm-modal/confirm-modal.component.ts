import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { GetOutsideModalClickDirective } from '../../directive/get-outside-modal-click.directive';
import { NgIf } from '@angular/common';
import { DriverEditSharedService } from '../../../pages/profiles/services/driver-edit-shared.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [GetOutsideModalClickDirective, NgIf],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  @Input() userName: string;
  @Input() buttonText: string;
  @Output() performChangeStatus = new EventEmitter<any>();
  @Input() isOpen: any;
  @Output() isModalClosed: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );
  private subs: any;
  @Input() fromDoc: boolean = false;
  @Input() fileName: string;

  constructor(private sharedDriverEditService: DriverEditSharedService) {}

  ngOnInit(): void {
    this.subs = this.sharedDriverEditService.isConfirmModalOpen.subscribe(
      (res: any) => {
        this.isOpen = res;
      }
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  performChangeStatuses() {
    this.performChangeStatus.emit();
  }

  closeModal() {
    this.isOpen = false;
    this.isModalClosed.emit(true);
  }

  onClick($event: boolean) {
    if ($event) {
      this.closeModal();
    }
  }
}
