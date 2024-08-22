import { Component } from '@angular/core';
import { TruckModel } from '../../../profiles/components/truck/models/truck.model';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-truck-popup',
  standalone: true,
  imports: [CommonModule, GiveMaxHeightDirective, FormsModule],
  templateUrl: './truck-popup.component.html',
  styleUrl: './truck-popup.component.scss',
})
export class TruckPopupComponent {
  private totalPages: number;

  constructor(
    private service: TruckService,
    public dialogRef: MatDialogRef<TruckPopupComponent>
  ) {}

  truckList: any[] = [];
  loading: boolean;
  page = 0;
  size = 20;

  closeDialog() {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.loading = true;
    this.truckList = [];
    this.getTruckList();
  }

  private getTruckList() {
    this.service
      .getTruckList(this.page, this.size, this.searchValue)
      .subscribe((res: any) => {
        res.data.responses.forEach((truck: TruckModel) => {
          truck.truck.preHireCheckList = String(truck.preHireChecklistList);
          truck.truck.noOfTrips = truck.noOfTrips;
          this.truckList.push(truck.truck);
        });
        this.totalPages = res.data.totalPages;
        this.loading = false;
      });
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.service
        .getTruckList(this.page, this.size, this.searchValue)
        .subscribe((res: any) => {
          res.data.responses.forEach((truck: TruckModel) => {
            truck.truck.preHireCheckList = String(truck.preHireChecklistList);
            truck.truck.noOfTrips = truck.noOfTrips;
            this.truckList.push(truck.truck);
          });
        });
    }
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
    this.loading = true;
    this.searchValue = '';
    this.getTruckList();
  }

  onKeyUpSearch($event: KeyboardEvent) {
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
}
