import { TripPoint } from '../../../manage-trip/model/trip.details.model';

export interface Trip {
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

export interface VehicleCategory {
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
}
