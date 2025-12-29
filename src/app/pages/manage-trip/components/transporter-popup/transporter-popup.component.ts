import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import { debounceTime, distinctUntilChanged, Subject, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transporter-popup',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './transporter-popup.component.html',
  styleUrl: './transporter-popup.component.scss',
})
export class TransporterPopupComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  private totalPages: number;
  private searchInput$ = new Subject<string>();

  constructor(
    private user: UserService,
    public dialogRef: MatDialogRef<TransporterPopupComponent>
  ) {}

  transporterList: any[] = [];
  loading: boolean;
  page = 0;
  size = 20;
  searchValue: any;

  closeDialog() {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.size = 20;
    this.page = 0;
    this.loading = true;
    this.transporterList = [];
    this.getTransporterList();
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(searchText => {
        this.loading = true;
        this.page = 0;
        this.size = 20;
        this.searchValue = searchText;
        this.transporterList = [];
        this.getTransporterList();
      });
  }

  ngAfterViewInit() {
    this.implementScrollToLoadMoreData();
  }

  private getTransporterList() {
    this.user
      .getTransporter(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.transporterList = res.data;
        this.totalPages = res.meta.totalPageCount;
        this.loading = false;
      });
  }

  onSelectTransporter(transporter: any) {
    this.dialogRef.close(transporter);
  }

  onClickClear() {
    this.searchValue = '';
    this.page = 0;
    this.size = 20;
    this.transporterList = [];
    this.getTransporterList();
  }

  onKeyUpSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value?.trim() || '';
    this.searchInput$.next(value);
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

    this.user
      .getTransporter(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        this.transporterList.push(...res.data);
        this.totalPages = res.meta.totalPageCount;
      });
  }

  informParent() {
    this.dialogRef.close('Transporter Popup Triggered')
  }
}
