import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener, Output, EventEmitter,
} from '@angular/core';
import { TruckModel } from '../../../profiles/components/truck/models/truck.model';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule } from '@angular/forms';
import { timer } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-truck-popup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './truck-popup.component.html',
  styleUrl: './truck-popup.component.scss',
})
export class TruckPopupComponent implements OnInit, OnDestroy {
  totalPages: number;

  constructor(
    private service: TruckService,
    public dialogRef: MatDialogRef<TruckPopupComponent>
  ) {}

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Output() truckPopupTriggered: EventEmitter<boolean> = new EventEmitter();

  truckList: TruckModel[] = [];
  loading: boolean;
  page = 0;
  size = 20;

  closeDialog() {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.page = 0;
    this.size = 20;
    this.loading = true;
    this.truckList = [];
    this.getTruckList();
  }

  ngAfterViewInit() {
    this.implementScrollToLoadMoreData();
  }

  private getTruckList() {
    this.service
      .getTruckList(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.truckList = res.data.responses;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.truckList = [];
    this.page = 0;
    this.size = 20;
  }

  protected readonly onselect = onselect;
  searchValue: any;

  onSelectTruck(truck: any) {
    this.dialogRef.close(truck);
  }

  onClickClear() {
    this.page = 0;
    this.size = 20;
    this.loading = true;
    this.searchValue = '';
    this.getTruckList();
  }

  onKeyUpSearch($event: KeyboardEvent) {
    this.page = 0;
    this.size = 20;
    this.truckList = [];
    this.loading = true;
    const target = ($event.target as HTMLInputElement).value;
    if (target?.length) {
      this.searchValue = target;
    } else {
      this.searchValue = '';
    }
    this.getTruckList();
  }

  private implementScrollToLoadMoreData() {
    timer(1000).subscribe(() => {
      // implement scroll event
      this.myScrollContainer.nativeElement.style.height = '100%';
      this.myScrollContainer.nativeElement.style.minHeight = '100%';
      this.myScrollContainer.nativeElement.style.overflow = 'auto';

      this.myScrollContainer.nativeElement.addEventListener('scroll', () => {
        this.checkIfScrollAtBottom();
      });
    });
  }

  checkIfScrollAtBottom() {
    const container = this.myScrollContainer.nativeElement;
    const atBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10; // Small buffer

    if (atBottom) {
      this.loadMoreData();
    }
  }

  loadMoreData() {
    if (this.page > this.totalPages - 1) return;
    this.page++;

    this.service.getTruckList(this.page, this.size).subscribe((res: any) => {
      this.truckList.push(...res.data.responses);
    });
  }

  informParent() {
    this.dialogRef.close('Truck Popup Triggered');
  }
}
