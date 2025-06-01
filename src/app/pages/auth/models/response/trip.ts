import { TripPoint } from '../../../manage-trip/model/trip.details.model';

export interface Trip {
  driver: Driver;
  sourceOfTruck: string;
  firstChallanUploadedDate: string;
  tripType: string;
  paymentType: string;
  challanReceivedFromDTOList: challanReceivedFromDTOList[];
  id: number;
  tripId: string;
  customerName: string;
  customerCode: string | null;
  tripStartDatetime: string;
  truckSize: string; // Added field for truck size
  truckCapacityInTon: string; // Added field for truck capacity
  vehicleCategory: VehicleCategory;
  good: Good;
  tripPoints: TripPoint[];
  truck: Truck | null; // Truck is nullable
  company: string | null;
  profitMargin: number;
  loadingPoint: string;
  unloadingPoint: string;
  status: string;
  customerRate: number | null;
  transporterRate: number | null;
  grossProfit: number;
  priority: boolean;
  createdAt: string; // Added field for creation timestamp
  challanStatus: string | null; // Added field for challan status
  transporterCode: string | null; // Added field for transporter code
  transporterName: string | null; // Added field for transporter name
  transporterPhone: string | null; // Added field for transporter phone
  challanStatusUpdatedAt: string | null; // Added field for challan status update timestamp
  tripEndedAt: string | null; // Added field for trip end timestamp
  challanStatusUpdatedBy: string | null; // Added field for who updated challan status
  challanHardCopyReceivedAt: string | null; // Added field for hard copy receipt timestamp
  challanHardCopyReceivedBy: string | null; // Added field for who received hard copy
  incidentOccurred: boolean; // Added field for incident occurrence
}

export interface Driver {
  id: number;
  userId: string;
  name: string;
  phone: string;
  email: string;
  userShortCode: string;
  enabled: boolean;
  roles: string[];
}

export interface challanReceivedFromDTOList {
  name: string;
  phoneNumber: string;
}

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
  id?: number; // Make id optional
  registrationZone?: string; // Make optional as it's missing
  registrationCategory?: string; // Make optional as it's missing
  registrationSerial?: string; // Make optional as it's missing
  registrationNum?: string; // Make optional as it's missing
  fullRegistrationNumber?: string; // Make optional as it's missing
  source?: string;
}

export interface tripType {
  id: number;
  name: string;
  active: boolean;
  enumName: string; // Added field for enum name
}

export interface paymentType {
  id: number;
  name: string;
  active: boolean;
  enumName?: string; // Added field for enum name
}

export const tripTypes: tripType[] = [
  {
    id: 1,
    name: 'Commercial Logistics',
    active: false,
    enumName: 'COMMERCIAL'
  },
  {
    id: 2,
    name: 'Project Logistics',
    active: false,
    enumName: 'PROJECT'
  }
];

export const paymentTypes: paymentType[] = [
  {
    id:1,
    name: 'Cash',
    active: false,
    enumName: 'CASH'
  },
  {
    id: 2,
    name: 'Invoice',
    active: true,
    enumName: 'INVOICE'
  },
  {
    id: 3,
    name: 'Cash & Invoice',
    active: false,
    enumName: 'CASH_AND_INVOICE'
  },
  {
    id: 4,
    name: 'Commission',
    active: false,
    enumName: 'COMMISSION'
  }
];
