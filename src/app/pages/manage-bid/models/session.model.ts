export interface SessionModel {
  id: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tripGroupId: number;
  tripIds: number[];
  availableTripIds: number[];
  availableTripId: string;
  title: string;
  goods: string;
  tripStartTime: string; // ISO date string
  bidStartTime: string; // ISO date string
  truckType: string;
  customerRate: number;
  profitExpectation: number;
  allowedTransporterId: number[]; // Assuming these are numeric IDs
  disallowedTransporterId: number[]; // Assuming these are numeric IDs
  numberOfTrips: number;
  numberOfAvailableTrips: number;
  loadingDistrict: string;
  unloadingDistrict: string;
  status: string;
  numberOfBids: number;
}
