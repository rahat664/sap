export interface VehicleCategory {
  id: number;
  name: string;
  imageUrl: string;
}

export interface Good {
  id: number;
  name: string;
}

export interface Truck {
  source: string;
  id: number;
  name: string | null;
  registrationZone: string;
  registrationCategory: string;
  registrationSerial: string;
  registrationNum: string;
  fullRegistrationNumber: string;
  driverCode: string | null;
  driverName: string | null;
  driverPhone: string | null;
  helperCode: string | null;
  helperName: string | null;
  helperPhone: string | null;
  regPaperFile: string | null;
  fitnessFile: string | null;
  routePermitFile: string | null;
  taxFile: string | null;
  caseFile: string | null;
  otherFile: string | null;
  fitnessCertExpDate: string | null;
  routePermitExpDate: string | null;
  taxExpDate: string | null;
  caseExpDate: string | null;
  createdBy: string;
  updatedBy: string | null;
  createdOn: string;
  updatedOn: string | null;
}

export interface TripPoint {
  id: number;
  pointDistrict: string;
  pointName: string;
  pointLat: number;
  pointLon: number;
  pointType: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripEvent {
  documents: eventDocuments[];
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  eventType: string;
  incidentOccurred: boolean;
  location: string;
  note: string;
}
export interface eventDocuments {
  id: number;
  fileUrl: string;
  documentType: string;
  relatedEntityId: number;
  relatedEntityName: string;
}

export interface TripData {
  sourceOfTruck: string;
  tripType: string;
  tripCancellationReason: any;
  id: number;
  tripId: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  tripStartDatetime: string;
  tripEndDatetime: string | null;
  tripStartedAt: string;
  tripEndedAt: string | null;
  vehicleCategory: VehicleCategory;
  numOfTrucks: string;
  truckSize: string;
  truckCapacityInTon: string;
  status: string;
  totalPrice: number | null;
  paidAmount: number | null;
  good: Good;
  truck: Truck;
  driverCode: string;
  driverName: string;
  driverPhone: string;
  helperCode: string | null;
  helperName: string;
  helperPhone: string;
  transporterCode: string;
  transporterName: string | null;
  transporterPhone: string | null;
  note: string;
  createdBy: string;
  createdByName: string;
  createdByPhone: string;
  createdAt: string;
  updatedAt: string;
  paymentType: string;
  tripPoints: TripPoint[];
  tripEvents: TripEvent[];
  customerRate: number;
  transporterRate: number | null;
  priority: boolean;
}

interface ApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: TripData;
}
