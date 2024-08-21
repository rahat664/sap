import { Component, HostListener } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TripService } from '../../services/trip.service';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { Router } from '@angular/router';
import { TripCreate } from '../../models/trip-create.model';
import { TripTemplate } from '../../models/trip-template.model';
import { MatDialog } from '@angular/material/dialog';
import { SuccessModalComponent } from '../../../../shared/modules/success-modal/success-modal.component';

@Component({
  selector: 'app-trip-create-overview',
  standalone: true,
  imports: [DatePipe, DecimalPipe, CurrencyPipe],
  templateUrl: './trip-create-overview.component.html',
  styleUrl: './trip-create-overview.component.scss',
})
export class TripCreateOverviewComponent {
  protected tripData: TripCreate;
  customerName: string;
  loadingPointName: string;
  unloadPointName: string;
  vehicleType: any;
  tripTemplateName: string;

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
      this.loadingPointName = this.tripData.points[0].pointName;
      this.unloadPointName = this.tripData.points[1].pointName;
    }

    this.service.getVehicleTypeList().subscribe((res: any) => {
      this.vehicleType = res.data;
    });
    this.userName = localStorage.getItem('name');
    this.userPhone = localStorage.getItem('userPhoneNumber');
    this.tripTemplateName = localStorage.getItem('templateName');
  }

  onCreateTrip() {
    this.service.createTrip(this.tripData).subscribe(
      (res: any) => {
        if (res.status === 'OK') {
          localStorage.removeItem('tripData');
          localStorage.removeItem('templateName');
          localStorage.removeItem('selectedCustomer');
          localStorage.removeItem('isFromBackEdit');
          localStorage.removeItem('isFromTemplate');
          const dialogRef = this.dialog
            .open(SuccessModalComponent, {
              width: '21.375rem',
              data: {
                title: 'Trip created',
                text: `Your ${res.data.length > 1 ? 'trips have' : 'trip has'} been created successfully.
              ${
                res.data.length > 1
                  ? 'Your trip numbers are ' +
                    res.data[0] +
                    '-' +
                    res.data[res.data.length - 1]?.split('-')[1]
                  : 'Your trip number is ' + res.data
              }
              `,
                buttonText: 'Okay',
              },
            })
            .afterClosed()
            .subscribe(() => {
              this.router.navigate(['/trip-list']);
            });
        } else {
          this.handleToaster.showError(res.message);
        }
      },
      (error: any) => {
        this.handleToaster.showError(error.message);
      }
    );
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
        points: this.tripData.points,
      };
      this.service.postTripTemplate(templateData).subscribe(res => {});
    }
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
    return (
      localStorage.getItem('role') === 'ROLE_ADMIN' ||
      localStorage.getItem('role') === 'ROLE_KAM'
    );
  }
}
