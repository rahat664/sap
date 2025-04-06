export interface TripPayment {
  id: number;
  tripId: string;
  customerName: string;
  customerCode: string;
  tripStartDatetime: string;
  truckSize: string;
  truckCapacityInTon: string;
  vehicleCategory: {
    name: string;
    imageUrl: string;
  };
  good: {
    id: number;
    name: string;
  };
  tripPoints: Array<{
    id: number;
    pointDistrict: string;
    pointName: string;
    pointType: string;
    pointLat: number;
    pointLon: number;
  }>;
  truck: {
    id: number;
    registrationZone: string;
    registrationCategory: string;
    registrationSerial: string;
    registrationNum: string;
  };
  status: string;
  customerRate: number;
  transporterRate: number;
  grossProfit: number;
  profitMargin: number;
  priority: boolean;
  createdAt: string;
  challanStatus: string;
  transporterCode: string;
  transporterName?: string;
  transporterPhone?: string;
  tripEndedAt: string;
  createdBy: string;
  createdByName: string;
  createdByPhone: string;
}
