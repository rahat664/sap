export interface Trip {
  id: number;
  tripId: string;
  customerName: string;
  customerCode: string | null;
  tripStartDatetime: string;
  vehicleName: string;
  vehicleImageUrl: string;
  goodName: string;
  tripPoints: TripPoint[];
  truckId: number | null;
  registrationZone: string | null;
  registrationCategory: string | null;
  registrationSerial: string | null;
  registrationNum: string | null;
  company: string | null;
  loadingPoint: string;
  unloadingPoint: string;
  status: string;
  cr: number;
  tr: number | null;
  gp: number;
  priority: boolean;
}

export interface TripPoint {
  pointDistrict: string;
  pointName: string;
  pointType: 'Loading' | 'Unloading';
  pointLat: string | null;
  pointLon: string | null;
}

