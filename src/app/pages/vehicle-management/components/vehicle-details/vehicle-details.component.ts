import { isSuccessStatus } from '../../../../shared/utils/response-status';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TruckService } from '../../../profiles/components/truck/services/truck.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ExpenseModel,
  TruckDocument,
  TruckModel,
} from '../../../profiles/components/truck/models/truck.model';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FallbackImagePipe } from '../../../../shared/pipes/fallback-image.pipe';
import { ImageErrorDirective } from '../../../../shared/directive/image-error.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { truckFileType } from '../../../profiles/components/truck/models/truck-file-type';
import { ImageGalleryComponent } from '../../../../shared/modules/image-gallery/image-gallery.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageGalleryService } from '../../../../shared/services/image-gallery/image-gallery.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { PreHireChecklistDetailsComponent } from '../../../profiles/components/truck/pre-hire-checklist-details/pre-hire-checklist-details.component';
import { TripService } from '../../../trip-list/services/trip.service';
import { CardComponent } from '../card/card.component';
import { DetailsCardComponent } from '../details-card/details-card.component';
import { WorkshopHistoryCreateDto } from '../../../profiles/components/truck/models/workshop-history.model';
import { ImagePipe } from '../../../../shared/pipes/image.pipe';
import { RefuelRecord } from '../../../profiles/components/truck/models/fuel.model';
import { statisticsSummary } from '../../../profiles/components/truck/models/vehicles-statics.model';
import { NewWorkshopPopupComponent } from '../new-workshop-popup/new-workshop-popup.component';
import { WorkshopRecordsComponent } from '../workshop-records/workshop-records.component';
import { FuelRecordPopupComponent } from '../fuel-record-popup/fuel-record-popup.component';
import { ConfirmApproveComponent } from '../../../../shared/modules/confirm-approve/confirm-approve.component';
import { ConfirmRejectComponent } from '../../../../shared/modules/confirm-reject/confirm-reject.component';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { FuelRecordsComponent } from '../fuel-records/fuel-records.component';
import { ExpenseRecordPopupComponent } from '../expense-record-popup/expense-record-popup.component';

@Component({
  selector: 'app-vehicle-details',
  imports: [
    MatButton,
    MatTab,
    MatTabGroup,
    NgForOf,
    FallbackImagePipe,
    ImageErrorDirective,
    NgIf,
    ReactiveFormsModule,
    MatMenuTrigger,
    MatMenu,
    PreHireChecklistDetailsComponent,
    DatePipe,
    CardComponent,
    DetailsCardComponent,
    ImagePipe,
    MatMenuItem,
  ],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss',
})
export class VehicleDetailsComponent implements OnInit {
  protected singleTruckData: TruckModel = {} as TruckModel;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  readonly dialog = inject(MatDialog);
  protected preHiredCheckList: any;
  countPassCheckList = 0;
  displayedColumns: {
    name: string;
    value: string;
  }[] = [
    { name: 'Model', value: 'model' },
    { name: 'Purchase date', value: 'purchaseDate' },
    { name: 'Purchase from', value: 'purchaseFrom' },
    { name: 'Yard', value: 'yard' },
    { name: 'Engine number', value: 'engineNumber' },
    { name: 'Chassis number', value: 'chassisNumber' },
    { name: 'Capacity', value: 'weightInTon' },
    { name: 'Size', value: 'size' },
    { name: 'Fuel type', value: 'fuelType' },
    { name: 'Fuel tank capacity', value: 'fuelCapacity' },
  ];
  displayedStatisticsColumns: {
    suffix: any;
    name: string;
    value: string;
    imageUrl: string;
  }[] = [
    {
      suffix: '',
      name: 'Completed trips',
      value: 'completedTrip',
      imageUrl: 'completeStat.svg',
    },
    {
      suffix: ' Km',
      name: 'Total Run',
      value: 'totalRun',
      imageUrl: 'totalRun.svg',
    },
    {
      suffix: ' L',
      name: 'Fuel Consumed',
      value: 'fuelConsumed',
      imageUrl: 'fuelConsumed.svg',
    },
    {
      suffix: ' Kg',
      name: 'CO2 emitted',
      value: 'carbonOmitted',
      imageUrl: 'co2Emitted.svg',
    },
  ];
  savedRegistrationPaper: TruckDocument[] = [];
  savedTaxPaper: TruckDocument[] = [];
  savedFitnessCertificate: TruckDocument[] = [];
  savedRoutePermit: TruckDocument[] = [];
  savedCasePaper: TruckDocument[] = [];
  savedOthers: TruckDocument[] = [];
  savedTruckImages: TruckDocument[] = [];
  savedInsurancePaper: TruckDocument[] = [];
  truckImages: any[] = [];
  insuranceImages: any[] = [];
  casePaperImages: any[] = [];
  regPaperImages: any[] = [];
  taxImages: any[] = [];
  fitnessImages: any[] = [];
  routePermitImages: any[] = [];
  othersImages: any[] = [];
  vehicleStatics: statisticsSummary = {} as statisticsSummary;
  vehicleExpenses: ExpenseModel[] = [];
  workshopHistories: WorkshopHistoryCreateDto[] = [];
  fuelHistories: RefuelRecord[] = [];

  constructor(
    private service: TruckService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private imageGalleryService: ImageGalleryService,
    private tripService: TripService,
    private router: Router,
    private toastr: HandleToastrService
  ) {}

  goBack() {}

  openEditVehicleDialog() {}

  ngOnInit() {
    this.getVehicleDetails();
  }

  private getVehicleDetails() {
    const vehicleId = this.activatedRoute.snapshot.paramMap.get('id');
    this.getVehicleStatics(vehicleId!);
    this.getVehicleExpenses(vehicleId!);
    this.getWorkshopHistories(vehicleId!);
    this.getFuelHistories(vehicleId!);
    this.service.getTruckById(vehicleId).subscribe((res: any) => {
      this.singleTruckData = res.data;
      const truck: TruckModel = res.data;
      const documents: TruckDocument[] = truck.vehicleDocumentList;
      this.splitDoucumentsByType(documents);
      this.service.getPreHireChecklist(truck.id.toString()).subscribe(
        (res: any) => {
          if (res && res.data) {
            // Do something with the pre-hire checklist
            this.preHiredCheckList = res.data;
            this.countPassCheckList = this.preHiredCheckList.filter(
              (x: any) => {
                return x.status === 'PASS';
              }
            ).length;
          } else {
          }
        },
        error => {
          // Handle error (e.g., show a notification)
        }
      );
    });
  }

  private splitDoucumentsByType(documents: TruckDocument[]) {
    // Split the documents by type
    documents.forEach(doc => {
      // split by truck document type
      const documentType = doc.documentType;
      switch (documentType) {
        case 'REG_PAPER_FILE':
          this.savedRegistrationPaper.push(doc);
          break;
        case 'TAX_FILE':
          this.savedTaxPaper.push(doc);
          break;
        case 'FITNESS_CERTIFICATE_FILE':
          this.savedFitnessCertificate.push(doc);
          break;
        case 'ROUTE_PERMIT_FILE':
          this.savedRoutePermit.push(doc);
          break;
        case 'CASE_FILE':
          this.savedCasePaper.push(doc);
          break;
        case 'OTHER_FILE':
          this.savedOthers.push(doc);
          break;
        case 'TRUCK_IMAGE':
          this.savedTruckImages.push(doc);
          break;
        case 'INSURANCE_FILE':
          this.savedInsurancePaper.push(doc);
          break;
      }
    });
  }

  checkThatFileIsAvailableOrNot(name: string) {
    let filteredFiles = [];
    switch (name) {
      case 'Registration paper':
        filteredFiles = this.savedRegistrationPaper;
        break;
      case 'Tax paper':
        filteredFiles = this.savedTaxPaper;
        break;
      case 'Fitness certificate':
        filteredFiles = this.savedFitnessCertificate;
        break;
      case 'Route permit':
        filteredFiles = this.savedRoutePermit;
        break;
      case 'Case paper':
        filteredFiles = this.savedCasePaper;
        break;
      case 'Others document':
        filteredFiles = this.savedOthers;
        break;
      case 'Truck images':
        filteredFiles = this.savedTruckImages;
        break;
      case 'Insurance paper':
        filteredFiles = this.savedInsurancePaper;
        break;
    }
    // Return the first three files or an empty array
    return filteredFiles.length > 0 ? filteredFiles.slice(0, 3) : [];
  }

  protected readonly truckFileType = truckFileType;
  viewMoreFormControlName: string;

  checkDateIsExpiredOrNot(expiryDate: string): {
    isExpired: boolean;
    text: string;
  } {
    const pastDate = new Date(expiryDate);
    const currentDate = new Date();

    // Normalize time to midnight for accurate comparison
    pastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Check if the past date is today or in the future
    if (pastDate >= currentDate) {
      return {
        isExpired: false,
        text: `Expiry date: ${this.datePipe.transform(pastDate, 'dd MMM, yyyy') || ''}`,
      };
    }

    // Calculate the time difference in milliseconds
    const timeDiff = currentDate.getTime() - pastDate.getTime();

    // Convert milliseconds to days, months, and years
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const yearDiff = Math.floor(dayDiff / 365);
    const monthDiff = Math.floor((dayDiff % 365) / 30);
    const remainingDays = dayDiff % 30;

    // Build the result string
    const resultParts = [];
    if (yearDiff > 0)
      resultParts.push(`${yearDiff} year${yearDiff > 1 ? 's' : ''}`);
    if (monthDiff > 0)
      resultParts.push(`${monthDiff} month${monthDiff > 1 ? 's' : ''}`);
    if (remainingDays > 0)
      resultParts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);

    return {
      isExpired: true,
      text: `Expired ${resultParts.join(', ')} ago`,
    };
  }

  getSpecificFiles(formControlName?: string, length?: number) {
    const maxFilesAllowed = length ? Math.max(0, 3 - length) : 3; // Ensure length does not go negative

    // Map of form control names to their respective file arrays
    const fileMap: Record<string, any[]> = {
      truckImages: this.truckImages,
      insuranceFiles: this.insuranceImages,
      regPaperFile: this.regPaperImages,
      taxFile: this.taxImages,
      fitnessCertificateFile: this.fitnessImages,
      routePermitFile: this.routePermitImages,
      casePaperFile: this.casePaperImages,
      others: this.othersImages,
    };

    const files = fileMap[formControlName!]; // Use non-null assertion as we've already checked for undefined

    if (files) {
      return files.slice(0, Math.min(files.length, maxFilesAllowed)); // Return the appropriate slice
    }

    return []; // Return an empty array if the formControlName is invalid or no files are found
  }

  onClickPdfDocument(file: any) {
    this.imageGalleryService.setCurrentImage(file);
    this.dialog.open(ImageGalleryComponent, {
      minHeight: '90vh',
      minWidth: '90%',
      // center the position
      data: {
        images: file.preview,
      },
    });
  }

  checkThatFileIsImageOrPdf(file: any) {
    return file.fileUrl.endsWith('.pdf') ? 'pdf' : 'image';
  }

  onClickImage(file: any, type: string) {
    // if the file is a PDF file, then convert it to blob of a PDF document file is just
    if (type === 'pdf') {
      // this is a blob of the file
      this.imageGalleryService.setCurrentImage(file.preSignedFileUrl);
      this.dialog.open(ImageGalleryComponent, {
        data: {
          images: file.preSignedFileUrl,
          fileType: 'pdf',
          fileName: `${file.documentType}.pdf`,
        },
      });
    } else {
      this.imageGalleryService.setCurrentImage(file.preSignedFileUrl);
      this.dialog.open(ImageGalleryComponent, {
        data: {
          images: file.preSignedFileUrl,
        },
      });
    }
  }

  getSavedFileArray(formControlName: string | undefined) {
    switch (formControlName) {
      case 'regPaperFile':
        return this.savedRegistrationPaper;
      case 'taxFile':
        return this.savedTaxPaper;
      case 'fitnessCertificateFile':
        return this.savedFitnessCertificate;
      case 'routePermitFile':
        return this.savedRoutePermit;
      case 'casePaperFile':
        return this.savedCasePaper;
      case 'others':
        return this.savedOthers;
      case 'truckImages':
        return this.savedTruckImages;
      case 'insuranceFiles':
        return this.savedInsurancePaper;
      default:
        return [];
    }
  }

  getFileArray(formControlName: string) {
    // Map of form control names to their respective file arrays
    const fileMap: Record<string, any[]> = {
      truckImages: this.truckImages,
      insuranceFiles: this.insuranceImages,
      regPaperFile: this.regPaperImages,
      taxFile: this.taxImages,
      fitnessCertificateFile: this.fitnessImages,
      routePermitFile: this.routePermitImages,
      casePaperFile: this.casePaperImages,
      others: this.othersImages,
    };

    // Return the corresponding file array or an empty array if the name is invalid
    return fileMap[formControlName] || [];
  }

  getTruckImageTitle(viewMoreFormControlName: string) {
    // Map of form control names to their respective titles
    const titleMap: Record<string, string> = {
      regPaperFile: 'Registration paper',
      taxFile: 'Tax paper',
      fitnessCertificateFile: 'Fitness certificate',
      routePermitFile: 'Route permit',
      casePaperFile: 'Case paper',
      others: 'Others document',
      truckImages: 'Truck images',
      insuranceFiles: 'Insurance paper',
    };

    // Return the title based on the form control name or an empty string if not found
    return titleMap[viewMoreFormControlName] || '';
  }

  onClickClosePopUp() {
    this.matMenuTrigger.closeMenu();
  }

  openChangeDriverDialog() {}

  private getVehicleStatics(vehicleId: string) {
    this.tripService.getVehicleStatistics(vehicleId).subscribe(
      (res: any) => {
        if (res && res.data) {
          // Do something with the vehicle statistics
          this.vehicleStatics = res.data;
        } else {
          // Handle the case where data is not available
        }
      },
      error => {
        // Handle error (e.g., show a notification)
      }
    );
  }

  protected readonly Date = Date;
  currentMonth: Date = new Date();

  private getVehicleExpenses(vehicleId: string) {
    this.service.getExpenses(vehicleId).subscribe(
      (res: any) => {
        if (res && res.data) {
          // Do something with the vehicle statistics
          this.vehicleExpenses = res.data;
        } else {
          // Handle the case where data is not available
        }
      },
      error => {
        // Handle error (e.g., show a notification)
      }
    );
  }

  private getWorkshopHistories(vehicleId: string) {
    const body = {
      vehicleId: [vehicleId],
    };
    const meta = {
      page: 0,
      limit: 1,
      sort: [{ order: 'DESC', field: 'entryDate' }],
    };
    this.service.getWorkshopHistory(body, meta).subscribe(
      (res: any) => {
        if (res && res.data) {
          // Do something with the vehicle statistics
          this.workshopHistories = res.data;
        } else {
          // Handle the case where data is not available
        }
      },
      error => {
        // Handle error (e.g., show a notification)
      }
    );
  }

  private getFuelHistories(vehicleId: string) {
    const body = {
      vehicleId: [vehicleId],
    };
    const meta = {
      page: 0,
      size: 1,
      sort: [{ field: 'refuelDateTime', direction: 'DESC' }],
    };
    this.service.getFuelHistory(body, meta).subscribe(
      (res: any) => {
        if (res && res.data) {
          // Do something with the vehicle statistics
          this.fuelHistories = res.data;
        } else {
          // Handle the case where data is not available
        }
      },
      error => {
        // Handle error (e.g., show a notification)
      }
    );
  }

  calculateTotalExpenses() {
    return this.vehicleExpenses.reduce(
      (total, expense) => total + expense.totalCostSum,
      0
    );
  }

  onClickStatisticsDetails() {
    localStorage.setItem(
      'detailedStatistics',
      JSON.stringify(this.vehicleStatics)
    );
    this.router.navigateByUrl(
      `/vehicle-management/${this.singleTruckData.id}/statistics-details`
    );
  }

  onClickCostDetails() {
    localStorage.setItem(
      'vehicleId',
      JSON.stringify(this.singleTruckData.id)
    );
    this.router.navigateByUrl(
      `/vehicle-management/${this.singleTruckData.id}/cost-details`
    );
  }

  onReply($event: string) {
    localStorage.setItem('vehicleId', this.singleTruckData.id.toString());
    const component =
      $event === 'Workshop'
        ? NewWorkshopPopupComponent
        : FuelRecordPopupComponent;
    if ($event === 'Workshop') {
      this.dialog
        .open(NewWorkshopPopupComponent, {
          minWidth: '37.125rem',
        })
        .afterClosed()
        .subscribe((res: any) => {
          if (res) {
            this.getWorkshopHistories(this.singleTruckData.id.toString());
          } else {
            // Handle error (e.g., show a notification)
          }
        });
    } else if ($event === 'Fuel') {
      this.dialog
        .open(FuelRecordPopupComponent, {
          minWidth: '37.125rem',
        })
        .afterClosed()
        .subscribe((res: any) => {
          if (res) {
            this.getFuelHistories(this.singleTruckData.id.toString());
          } else {
            // Handle error (e.g., show a notification)
          }
        });
    }
  }

  onClickFuelDetails() {
    this.dialog.open(FuelRecordsComponent, {
      minWidth: '70vw',
      data: {
        isFuelRecord: true,
        vehicleId: this.singleTruckData.id,
      },
    });
  }

  onClickChangeStatus(status: string) {
    if (status === 'Approve') {
      this.dialog
        .open(ConfirmApproveComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the truck with registration number ',
            text: `${this.singleTruckData?.fullRegistrationNumber}?`,
            buttonText: 'Approve',
          },
        })
        .afterClosed()
        .subscribe((res: any) => {
          if (res === 'updated') {
            // Do something
            const formData = new FormData();
            const payload: Record<string, any> = {};
            payload['id'] = this.singleTruckData?.id;
            payload['status'] = 'Approved';
            formData.append('payload', JSON.stringify(payload));
            this.service.editTruck(formData).subscribe(
              (res: any) => {
                // Handle response
                if (isSuccessStatus(res?.status)) {
                  this.toastr.showSuccess(res.message);
                  this.singleTruckData = {} as TruckModel;
                  this.getVehicleDetails();
                } else {
                  this.toastr.showError(res.message);
                }
              },
              error => {
                // Handle error
                this.toastr.showError(error.error.message);
              }
            );
          }
        });
    } else {
      this.dialog
        .open(ConfirmRejectComponent, {
          data: {
            title: 'Attention',
            textPrefix: 'the truck with registration number ',
            text: `${this.singleTruckData?.fullRegistrationNumber}?`,
            buttonText: 'Reject',
            reasonAvailable: true,
          },
        })
        .afterClosed()
        .subscribe((res: any) => {
          if (res.status === 'rejected') {
            // Do something
            const formData = new FormData();
            const payload: Record<string, any> = {};
            payload['id'] = this.singleTruckData?.id;
            payload['status'] = 'Rejected';
            payload['rejectedReason'] = res.reason;
            formData.append('payload', JSON.stringify(payload));
            this.service.editTruck(formData).subscribe(
              (res: any) => {
                // Handle response
                if (isSuccessStatus(res?.status)) {
                  this.toastr.showSuccess(res.message);
                  this.singleTruckData = {} as TruckModel;
                  this.getVehicleDetails();
                } else {
                  this.toastr.showError(res.message);
                }
              },
              error => {
                // Handle error
                this.toastr.showError(error.error.message);
              }
            );
          }
        });
    }
  }

  onClickEditTruck() {
    localStorage.setItem(
      'vehicleDetails',
      JSON.stringify(this.singleTruckData)
    );
    this.router.navigateByUrl(
      `/vehicle-management/${this.singleTruckData.id}/edit-vehicle`
    );
  }

  onClickWork() {
    this.dialog.open(WorkshopRecordsComponent, {
      minWidth: '70vw',
      data: {
        isFuelRecord: true,
        vehicleId: this.singleTruckData.id,
      },
    });
  }

  addNewExpenseRecord() {
    localStorage.setItem('vehicleId', this.singleTruckData.id.toString());
    this.dialog
      .open(ExpenseRecordPopupComponent, {
        minWidth: '37.125rem',
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res) {
          this.getVehicleExpenses(this.singleTruckData.id.toString());
        } else {
          // Handle error (e.g., show a notification)
        }
      });
  }
}
