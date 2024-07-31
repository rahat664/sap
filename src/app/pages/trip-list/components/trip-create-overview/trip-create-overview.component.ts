import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TripService } from '../../services/trip.service';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { Router } from '@angular/router';
import { TripCreate } from '../../models/trip-create.model';
import { TripTemplate } from '../../models/trip-template.model';

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
    private router: Router
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
          this.handleToaster.showSuccess('Trip created successfully');
          localStorage.removeItem('templateName');
          localStorage.removeItem('selectedCustomer');
          this.router.navigate(['/trip-list']);
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
}
