export interface VehicleCategory {
  id: number;
  name: string;
  imageUrl: string;
}

export class Good {
  id: number;
  name: string;
}

export class Point {
  id: number;
  pointDistrict: string;
  pointName: string;
  pointLat: number;
  pointLon: number;
  pointType: string;
}

export class TripTemplateResponse {
  id: number;
  customerCode: string;
  name: string;
  categoryId: number | null;
  vehicleCategory: VehicleCategory;
  numOfTrucks: string;
  truckSize: string;
  truckCapacityInTon: string;
  customerRate: number;
  good: Good;
  note: string;
  points: Point[];
  paymentType: string;
  tripType: string;
}
