// src/app/models/refuel.interfaces.ts

export interface ApiResponse<T> {
  timestamp: string;            // ISO string
  status: string;               // e.g., "OK"
  statusCode: number;           // e.g., 200
  data: T[];
  meta: Meta;
}

export interface Meta {
  page: number;
  prevPage: number;
  nextPage: number;
  limit: number;
  totalRecords: number;
  resultCount: number;
  totalPageCount: number;
  sort: SortOption[];
}

export interface SortOption {
  order: 'ASC' | 'DESC';
  field: string;
}

export interface RefuelRecord {
  id: number;
  createdBy: string;
  createdAt: string;                // ISO date-time
  updatedBy: string | null;
  updatedAt: string | null;

  vehicleId: number;
  vehicle: Vehicle;

  refuelDateTime: string;           // ISO date-time
  fuelVolumeInLiters: number;       // 0 in sample
  unitPrice: number;                // 0 in sample
  totalCost: number;                // 1225 in sample
  odometerReading: number;          // 0 in sample

  fuelType: FuelType | string;      // keep string fallback for unseen values
  stationName: string;
  paymentMethod: PaymentMethod | string;
  notes: string | null;
}

export type FuelType = 'OCTANE' | 'DIESEL' | 'PETROL' | 'CNG';
export type PaymentMethod = 'CASH' | 'CARD' | 'MFS' | 'BANK' | 'OTHER';

export interface Vehicle {
  id: number;
  createdBy: string;
  createdAt: string;                 // ISO date-time
  updatedBy: string | null;
  updatedAt: string | null;

  name: string | null;

  fitnessCertExpDate: string | null; // ISO date-time or null
  routePermitExpDate: string | null;
  taxExpDate: string | null;
  caseExpDate: string | null;
  insuranceExpDate: string | null;

  checklist: string | null;

  status: 'Pending' | 'Approved' | 'Rejected' | string; // current sample "Pending"
  rejectedReason: string | null;

  year: number;                      // 2010
  maker: string;                     // "Honda"
  model: string;                     // "EV-10"

  purchaseDate: string;              // ISO date-time
  purchaseFrom: string;
  yard: string;

  engine: string;                    // "2-NZ FE"
  chassisNumber: string;             // "Chasis-2300"

  fuelType: string | null;           // vehicle's fuel type (can differ from refuel fuel type)
  displacement: string;              // kept as string per sample ("3000")
  enginePower: string;               // kept as string per sample ("220")
  size: string;                      // "40"
  fuelCapacity: string;              // "60"
  tyre: string;                      // "45inch"

  type: number;                      // 5
  wheelbase: string;                 // "5600mm"
  weightInTon: string;               // "10"

  registrationZone: string;          // "Chatta Metro"
  registrationCategory: string;      // "BHA"
  registrationSerial: string;        // "22"
  registrationNum: string;           // "1122"
  fullRegistrationNumber: string;    // "Chatta Metro BHA 22-1122"

  driverCode: string | null;
  driverName: string | null;
  driverPhone: string | null;

  helperCode: string | null;
  helperName: string | null;
  helperPhone: string | null;

  transporterCode: string | null;
  source: string | null;

  ownership: 'OWN' | 'LEASE' | string;

  registrationCategoryDisplay?: string; // optional UI helpers if you add later
  registrationZoneDisplay?: string;
}

// Convenience alias for your concrete API:
export type RefuelListResponse = ApiResponse<RefuelRecord>;
