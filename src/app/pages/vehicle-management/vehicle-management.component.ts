import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleStatsButtonComponent } from './shared/buttons/vehicle-stats-button/vehicle-stats-button.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TruckModel } from '../profiles/components/truck/models/truck.model';
import { debounceTime } from 'rxjs';
import { TruckService } from '../profiles/components/truck/services/truck.service';
import { TruckFilterComponent } from '../profiles/components/truck/truck-filter/truck-filter.component';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
import { numberPipe } from '../../shared/pipes/number-seperator.pipe';

@Component({
  selector: 'app-vehicle-management',
  imports: [
    CommonModule,
    GetElementHeightDirective,
    ReactiveFormsModule,
    FormsModule,
    VehicleStatsButtonComponent,
    TruckFilterComponent,
    GiveMaxHeightDirective,
    LoadingComponent,
    RouterLink,
  ],
  templateUrl: './vehicle-management.component.html',
  styleUrl: './vehicle-management.component.scss',
})
export class VehicleManagementComponent {
  height: any;
  isOffCanvasVisible: any;
  searchValue: any;
  truckList: TruckModel[] = [];
  totalPages: number = 0;
  loading: boolean = false;
  showButtons: any[] = [
    { title: 'Total', totalNumber: '0' },
    { title: 'Own', totalNumber: '0' },
    { title: 'Third Party', totalNumber: '0' },
  ];
  private page: number = 0;
  private size: number = 20;
  statusInputPlaceholder: string = '';
  private from: any;
  private to: any;
  filterApplied: boolean = false;
  filterData: any = {};
  filterForm: FormGroup;
  inputPlaceholder: string = '';
  filterOpened: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: TruckService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  onClickFilterOpen() {}

  onClickClear() {}

  onKeyUpSearch($event: KeyboardEvent) {}

  get filterSummary(): string {
    const parts: string[] = [];
    if (this.filterData.startDate)
      parts.push(
        `From: <b>${this.datePipe.transform(this.filterData.startDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.endDate)
      parts.push(
        `To: <b>${this.datePipe.transform(this.filterData.endDate, 'dd MMM yyyy')}</b>`
      );
    if (this.filterData.statusInputPlaceholder)
      parts.push(
        `Truck Status: <b>${this.filterData.statusInputPlaceholder}</b>`
      );

    return parts.join(', ');
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      if (this.searchValue) {
        this.service
          .getTruckList(
            this.page,
            this.size,
            this.searchValue,
            this.statusInputPlaceholder == 'All'
              ? ''
              : this.statusInputPlaceholder,
            null,
            null,
            null,
            this.from,
            this.to
          )
          .pipe(debounceTime(1000))
          .subscribe((res: any) => {
            this.truckList.push(...res.data.responses);
          });
      } else {
        this.service
          .getTruckList(
            this.page,
            this.size,
            null,
            this.statusInputPlaceholder == 'All'
              ? ''
              : this.statusInputPlaceholder,
            null,
            null,
            null,
            this.from,
            this.to
          )
          .subscribe((res: any) => {
            this.truckList.push(...res.data.responses);
          });
      }
    }
  }

  ngOnInit() {
    this.truckList = [];
    this.loading = true;
    this.getTruckListFromResolvedState();
  }

  getTruckListFromResolvedState() {
    this.activatedRoute.data.subscribe((data: any) => {
      const res = data.truck.data;
      this.truckList = res.data.responses;
      this.totalPages = res.data.totalPages;
      this.loading = false;
    });
  }

  onCLickClearAll() {
    localStorage.removeItem('tripFilterData');
    this.filterForm.reset();
    this.filterApplied = false;
    this.filterData = {};
    this.page = 0;
    this.size = 30;
    this.loading = true;
    this.from = '';
    this.to = '';
    this.inputPlaceholder = '';
    this.statusInputPlaceholder = '';
    this.getTruckList();
  }
  onFilterData($event: any) {
    this.filterData = $event;
  }

  private getTruckList() {
    this.page = 0;
    this.loading = true;
    if (this.searchValue) {
      //subscribe with debounced time
      this.service
        .getTruckList(
          this.page,
          this.size,
          this.searchValue,
          this.statusInputPlaceholder == 'All'
            ? ''
            : this.statusInputPlaceholder,
          null,
          null,
          null,
          this.from,
          this.to
        )
        .pipe(debounceTime(1000))
        .subscribe((res: any) => {
          this.truckList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    } else {
      this.service
        .getTruckList(
          this.page,
          this.size,
          null,
          this.statusInputPlaceholder == 'All'
            ? ''
            : this.statusInputPlaceholder,
          null,
          null,
          null,
          this.from,
          this.to
        )
        .subscribe((res: any) => {
          this.truckList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        });
    }
  }

  onFilterApply() {
    if (
      this.filterData?.startDate ||
      this.filterData?.endDate ||
      this.filterData?.statusInputPlaceholder
    ) {
      this.filterApplied = true;
      this.filterOpened = false;
      this.from = this.filterData.startDate;
      this.to = this.filterData.endDate;
      this.statusInputPlaceholder = this.filterData.statusInputPlaceholder;
      this.page = 0;
      this.size = 30;
      this.loading = true;
      this.getTruckList();
    } else {
      localStorage.removeItem('tripFilterData');
      this.filterApplied = false;
      this.loading = true;
      this.page = 0;
      this.size = 30;
      this.from = '';
      this.to = '';
      this.statusInputPlaceholder = '';
      this.filterForm.reset();
      this.getTruckList();
    }
  }

  protected readonly Number = Number;

  onClickTruckDetails(truck: TruckModel) {

  }
}
