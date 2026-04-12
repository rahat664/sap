import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { GetElementHeightDirective } from '../../shared/directive/get-element-height.directive';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleStatsButtonComponent } from './shared/buttons/vehicle-stats-button/vehicle-stats-button.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TruckModel } from '../profiles/components/truck/models/truck.model';
import { Subject, debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { TruckService } from '../profiles/components/truck/services/truck.service';
import { TruckFilterComponent } from '../profiles/components/truck/truck-filter/truck-filter.component';
import { GiveMaxHeightDirective } from '../../shared/directive/give-max-height.directive';
import { LoadingComponent } from '../../shared/modules/loading/loading.component';
import { numberPipe } from '../../shared/pipes/number-seperator.pipe';
import { TruckFilesArray, truckFileType, TruckFileType } from '../profiles/components/truck/models/truck-file-type';
import { MatTooltip } from '@angular/material/tooltip';

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
    MatTooltip,
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
    { title: 'Total', totalNumber: '0', property: 'All', active: true },
    { title: 'Own', totalNumber: '0' , property: 'OWN', active: false},
    { title: 'Third Party', totalNumber: '0' , property: 'THIRD_PARTY', active: false},
  ];
  private page: number = 0;
  private size: number = 20;
  statusInputPlaceholder: string = '';
  hasDocument: boolean | null = null;
  private from: any;
  private to: any;
  filterApplied: boolean = false;
  filterData: any = {};
  filterForm: FormGroup;
  inputPlaceholder: string = '';
  filterOpened: boolean = false;
  truckFileType: TruckFileType[] = truckFileType;
  summaryValue: {
    All: number;
    OWN: number;
    THIRD_PARTY: number;
  } = { All: 0, OWN: 0, THIRD_PARTY: 0 };

  // Live search stream
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: TruckService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  onClickFilterOpen() {
    this.filterOpened = true;
  }

  onClickClear() {
    this.searchValue = '';
    this.truckList = [];
    this.page = 0;
    this.getTruckList();
  }

  onSearchChange(value: string) {
    this.searchInput$.next(value ?? '');
  }

  onKeyUpSearch($event: KeyboardEvent) {
    const value = ($event.target as HTMLInputElement).value?.trim() || '';
    this.searchInput$.next(value);
  }

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
    if (this.filterData?.hasDocument)
      parts.push(`Has Document: <b>${this.hasDocument ? 'Yes' : 'No'}</b>`);

    return parts.join(', ');
  }

  onBottom($event: boolean) {
    if ($event && this.page < this.totalPages - 1) {
      this.page++;
      const hasDocumentsFilter = this.filterData?.hasDocument
        ? this.hasDocument
        : undefined;
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
            this.to,
            hasDocumentsFilter
          )
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
            this.to,
            hasDocumentsFilter
          )
          .subscribe((res: any) => {
            this.truckList.push(...res.data.responses);
          });
      }
    }
  }

  ngOnInit() {
    const truckFilterData = localStorage.getItem('truckFilterData');
    if (truckFilterData) {
      this.filterData = JSON.parse(truckFilterData);
      this.hasDocument =
        this.filterData?.hasDocument === 'Yes'
          ? true
          : this.filterData?.hasDocument === 'No'
            ? false
            : null;
      this.filterApplied = true;
      this.from = this.filterData.startDate;
      this.to = this.filterData.endDate;
      this.statusInputPlaceholder = this.filterData.statusInputPlaceholder;
      this.truckList = [];
      this.getTruckList();
    } else {
      this.truckList = [];
      this.loading = true;
      this.getTruckListFromResolvedState();
    }

    // Wire up debounced live-search
    this.searchInput$
      .pipe(
        map(value => (value || '').trim()),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchValue = value;
        this.truckList = [];
        this.page = 0;
        this.getTruckList();
      });
  }

  getTruckListFromResolvedState() {
    this.activatedRoute.data.subscribe((data: any) => {
      const res = data.truck.data;
      this.truckList = res.data.responses;
      this.totalPages = res.data.totalPages;
      this.loading = false;
      this.summaryValue = res.data.Summary
    });
  }

  onCLickClearAll() {
    localStorage.removeItem('truckFilterData');
    this.filterForm.reset();
    this.filterApplied = false;
    this.hasDocument = null;
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
    const hasDocumentsFilter = this.filterData?.hasDocument
      ? this.hasDocument
      : undefined;
    if (this.searchValue && !this.filterData?.hasDocument) {
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
        .subscribe((res: any) => {
          this.truckList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
          this.summaryValue = res.data.Summary;
        });
    } else if (this.searchValue && this.filterData?.hasDocument) {
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
          this.to,
          hasDocumentsFilter
        )
        .subscribe((res: any) => {
          this.truckList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
          this.summaryValue = res.data.Summary;
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
          this.to,
          hasDocumentsFilter
        )
        .subscribe((res: any) => {
          this.truckList = res.data.responses;
          this.totalPages = res.data.totalPages;
          this.loading = false;
          this.summaryValue = res.data.Summary;
        });
    }
  }

  onFilterApply() {
    if (
      this.filterData?.startDate ||
      this.filterData?.endDate ||
      this.filterData?.statusInputPlaceholder ||
      this.filterData?.hasDocument
    ) {
      this.hasDocument =
        this.filterData?.hasDocument === 'Yes'
          ? true
          : this.filterData?.hasDocument === 'No'
            ? false
            : null;
      this.filterApplied = true;
      this.filterOpened = false;
      this.from = this.filterData.startDate;
      this.to = this.filterData.endDate;
      this.statusInputPlaceholder = this.filterData.statusInputPlaceholder;
      this.page = 0;
      this.size = 30;
      this.loading = true;
      // Clear current list before fetching filtered results
      this.truckList = [];
      this.getTruckList();
    } else {
      localStorage.removeItem('truckFilterData');
      this.filterApplied = false;
      this.loading = true;
      this.page = 0;
      this.size = 30;
      this.from = '';
      this.to = '';
      this.hasDocument = null;
      this.statusInputPlaceholder = '';
      this.filterForm.reset();
      this.getTruckList();
    }
  }

  protected readonly Number = Number;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClickTruckDetails(truck: TruckModel) {
  }

  onClickAddTruck() {
    this.router.navigate(['/vehicle-management/add-vehicle']);
  }

  checkHowManyDocsAreAvailable(truck: TruckModel) {
    let count = 0;
    this.truckFileType.forEach(fileType => {
      const files = truck.vehicleDocumentList?.filter(
        doc => doc.documentType === fileType.enumName
      );
      if (files && files.length > 0) {
        count++;
      }
    });
    return count;
  }

  checkThatAnyDocumentIsExpired(truck: TruckModel) {
    const today = new Date();
    let isExpired = false;
    this.truckFileType.forEach(fileType => {
      if (fileType.expiryAvailable) {
        const files = truck.vehicleDocumentList?.filter(
          doc => doc.documentType === fileType.enumName
        );
        if (files && files.length > 0) {
          files.forEach(file => {
            if (file.expiryDate) {
              const expiryDate = new Date(file.expiryDate);
              if (expiryDate < today) {
                isExpired = true;
              }
            }
          });
        }
      }
    });
    return isExpired;
  }

  returnHowManyDocumentIsExpired(truck: TruckModel) {
    const today = new Date();
    let count = 0;
    this.truckFileType.forEach(fileType => {
      if (fileType.expiryAvailable) {
        const files = truck.vehicleDocumentList?.filter(
          doc => doc.documentType === fileType.enumName
        );
        if (files && files.length > 0) {
          files.forEach(file => {
            if (file.expiryDate) {
              const expiryDate = new Date(file.expiryDate);
              if (expiryDate < today) {
                count++;
              }
            }
          });
        }
      }
    });
    return count  > 1 ? `${count} Documents Expired` : `${count} Document Expired`;
  }

  onClickOwnership(property: any) {
    this.showButtons.forEach(button => {
      button.active = button.property === property
    });
  }
}
