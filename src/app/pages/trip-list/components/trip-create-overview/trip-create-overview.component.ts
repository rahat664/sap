import { Component, HostListener, OnInit } from '@angular/core';
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import { TripService } from '../../services/trip.service';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { Router } from '@angular/router';
import { TripCreate } from '../../models/trip-create.model';
import { TripTemplate } from '../../models/trip-template.model';
import { MatDialog } from '@angular/material/dialog';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';
import { ErrorModalComponent } from '../../../../shared/modules/error-modal/error-modal.component';
import { numberPipe } from '../../../../shared/pipes/number-seperator.pipe';

@Component({
  selector: 'app-trip-create-overview',
  imports: [DatePipe, NgForOf, NgIf, numberPipe],
  templateUrl: './trip-create-overview.component.html',
  styleUrl: './trip-create-overview.component.scss',
})
export class TripCreateOverviewComponent implements OnInit {
  protected tripData: TripCreate;
  customerName: string;
  loadingPointNames: any[] = [];
  unloadPointNames: any[] = [];
  vehicleType: any;
  tripTemplateName: string;
  loading: boolean;

  constructor(
    private service: TripService,
    private handleToaster: HandleToastrService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.tripData = JSON.parse(localStorage.getItem('tripData'));
    this.customerName = JSON.parse(
      localStorage.getItem('selectedCustomer')
    ).name;
    if (this.tripData) {
      this.loadingPointNames = [];
      this.unloadPointNames = [];

      this.loadingPointNames = this.tripData.points.filter(
        point => point.pointType === 'Loading'
      );

      this.unloadPointNames = this.tripData.points.filter(
        point => point.pointType === 'Unloading'
      );
    }

    this.service.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleType = res.data;
    });
    this.userName = localStorage.getItem('name');
    this.userPhone = localStorage.getItem('userPhoneNumber');
    this.tripTemplateName = localStorage.getItem('templateName');
  }

  onCreateTrip() {
    this.loading = true;
    this.service.createTrip(this.tripData).subscribe(
      (res: any) => {
        if (res.status === 'OK') {
          const tripOrTrips = res.data.length > 1 ? 'trips' : 'trip';
          let startText = `Your ${tripOrTrips}`;
          const tripMessage = `been created successfully.
              ${
                res.data.length > 1
                  ? 'Your trip numbers are ' +
                    res.data[0] +
                    '-' +
                    res.data[res.data.length - 1]?.split('-')[1]
                  : 'Your trip number is ' + res.data
              }
              `;
          let titleText = `${startText} ${tripMessage}`;
          if (this.tripTemplateName) {
            const templateData: TripTemplate = {
              name: this.tripTemplateName,
              customerCode: this.tripData.customerCode,
              categoryId: this.tripData.categoryId,
              truckSize: this.tripData.truckSize,
              numOfTrucks: this.tripData.numOfTrucks,
              truckCapacityInTon: this.tripData.truckCapacityInTon,
              goodsId: this.tripData.goodsId,
              goodsName: this.tripData.goodsName,
              customerRate: this.tripData.customerRate,
              note: this.tripData.note,
              paymentType: this.tripData.paymentType,
              points: this.tripData.points,
            };
            this.service.postTripTemplate(templateData).subscribe(
              (res: any) => {
                if (res.status === 'OK') {
                  localStorage.removeItem('tripData');
                  localStorage.removeItem('templateName');
                  localStorage.removeItem('selectedCustomer');
                  localStorage.removeItem('isFromBackEdit');
                  localStorage.removeItem('isFromTemplate');
                  startText = `Your ${tripOrTrips}  and template have`;
                  titleText = `${startText} ${tripMessage} and template name is "${this.tripTemplateName}"`;
                  const dialogRef = this.dialog
                    .open(SuccessModalComponent, {
                      width: '21.375rem',
                      data: {
                        title: 'Trip created',
                        text: titleText,
                        buttonText: 'Okay',
                      },
                    })
                    .afterClosed()
                    .subscribe(() => {
                      this.loading = false;
                      this.router.navigate(['/trip-list']);
                    });
                } else {
                  const dialogRef = this.dialog
                    .open(SuccessModalComponent, {
                      width: '21.375rem',
                      data: {
                        title: 'Trip created',
                        text: titleText,
                        buttonText: 'Okay',
                      },
                    })
                    .afterClosed()
                    .subscribe(() => {
                      this.router.navigate(['/trip-list']);
                    });
                }
              },
              error => {
                const dialogRef = this.dialog
                  .open(SuccessModalComponent, {
                    width: '21.375rem',
                    data: {
                      title: 'Trip created',
                      text: titleText,
                      buttonText: 'Okay',
                    },
                  })
                  .afterClosed()
                  .subscribe(() => {
                    this.router.navigate(['/trip-list']);
                  });
              }
            );
          } else {
            const dialogRef = this.dialog
              .open(SuccessModalComponent, {
                width: '21.375rem',
                data: {
                  title: 'Trip created',
                  text: titleText,
                  buttonText: 'Okay',
                },
              })
              .afterClosed()
              .subscribe(() => {
                this.router.navigate(['/trip-list']);
              });
          }
        } else {
          this.dialog.open(ErrorModalComponent, {
            width: '21.375rem',
            data: {
              title: 'Error',
              text: res.error.message,
              buttonText: 'Okay',
            },
          });
        }
      },
      (error: any) => {
        this.dialog.open(ErrorModalComponent, {
          width: '21.375rem',
          data: {
            title: 'Error',
            text: error.error.message,
            buttonText: 'Okay',
          },
        });
      }
    );
  }

  getTruckName(truck_id: any) {
    return this.vehicleType.find((truck: { id: any }) => truck.id === truck_id)
      ?.name;
  }

  protected readonly Number = Number;
  userName: string;
  userPhone: string;
  protected readonly onclick = onclick;

  onclickEdit() {
    localStorage.setItem('isFromBackEdit', 'true');
    localStorage.setItem('tripData', JSON.stringify(this.tripData));
    this.router.navigate(['/trip-create/create']);
  }

  // back button functionality handle
  @HostListener('window: popstate', ['$event'])
  onPopState(event: any) {
    localStorage.setItem('isFromBackEdit', 'true');
    localStorage.setItem('tripData', JSON.stringify(this.tripData));
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM');
  }
}
