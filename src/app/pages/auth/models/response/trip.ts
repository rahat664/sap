export interface Trip {
  id: number;
  tripId: string;
  customerName: string;
  customerCode: string | null;
  tripStartDatetime: string;
  vehicleCategory: VehicleCategory;
  good: Good;
  tripPoints: TripPoint[];
  truck: Truck;
  company: string | null;
  loadingPoint: string;
  unloadingPoint: string;
  status: string;
  customerRate: number | null;
  transporterRate: number | null;
  grossProfit: number;
  priority: boolean;
}

export interface VehicleCategory {
  name: string;
  imageUrl: string;
}

export interface Good {
  id: number;
  name: string;
}

export interface TripPoint {
  pointDistrict: string;
  pointName: string;
  pointType: 'Loading' | 'Unloading';
  pointLat: number;
  pointLon: number;
}

export interface Truck {
  id: number;
  registrationZone: string;
  registrationCategory: string;
  registrationSerial: string;
  registrationNum: string;
  fullRegistrationNumber: string;
}
