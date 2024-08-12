import { Component } from '@angular/core';
import { UserService } from '../../../profiles/services/user.service';
import { debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { GiveMaxHeightDirective } from '../../../../shared/directive/give-max-height.directive';

@Component({
  selector: 'app-driver-popup',
  standalone: true,
  imports: [CommonModule, GiveMaxHeightDirective],
  templateUrl: './driver-popup.component.html',
  styleUrl: './driver-popup.component.scss',
})
export class DriverPopupComponent {
  private totalPages: number;

  constructor(
    private user: UserService,
    public dialogRef: MatDialogRef<DriverPopupComponent>
  ) {}

  driverList: any[] = [];
  loading: boolean;
  page = 0;
  size = 20;

  closeDialog() {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.loading = true;
    this.driverList = [];
    this.getHelperList();
  }

  private getHelperList() {
    this.user.getDriver(this.page, this.size).subscribe((res: any) => {
      this.driverList = res.data.responses;
      this.totalPages = res.data.totalPages;
      this.loading = false;
    });
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      this.user
        .getDriver(this.page, this.size)
        .pipe(debounceTime(500))
        .subscribe((res: any) => {
          this.driverList.push(...res.data.responses);
          this.totalPages = res.data.totalPages;
        });
    }
  }

  ngOnDestroy() {
    this.driverList = [];
    this.page = 0;
    this.size = 20;
  }

  onSelectDriver(driver) {
    this.dialogRef.close(driver);
  }
}
