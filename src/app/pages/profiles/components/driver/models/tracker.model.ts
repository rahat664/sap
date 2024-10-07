export interface Vendor {
  id: number;
  name: string;
  baseUrl: string;
  loginUrl: string;
  liveLocationUrl: string;
  websiteUrl: string;
  headers: any; // or { [key: string]: any } if you want to keep it flexible
  params: any; // or { [key: string]: any } if you want to keep it flexible
}

export interface VehicleTracker {
  id: number;
  name: string | null;
  url: string | null;
  urlType: string | null;
  headers: any | null; // You might use a specific type if known
  params: any | null; // You might use a specific type if known
  body: string | null;
  loginUrl: string | null;
  lastRecordedLatitude: number;
  lastRecordedLongitude: number;
  lastLocationRecordedAt: string; // ISO 8601 string format
  status: string;
  vehicleId: number;
  vendor: Vendor;
  trackerId: string;
  vehicleRegistrationNumber: string;
  createdAt: string; // ISO 8601 string format
  updatedAt: string; // ISO 8601 string format
  trackerType: string;
  checked: boolean;
}
