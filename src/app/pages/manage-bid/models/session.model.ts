export interface SessionModel {
  id: number;
  createdAt: string; // ISO datetime
  tripGroupId: number;
  tripIds: number[];
  availableTripIds: number[];
  availableTripId: string;
  title: string;
  customerCode: string;
  customerName: string;
  goods: string;
  tripStartTime: string; // ISO datetime
  bidStartTime: string;  // ISO datetime
  truckType: string;
  customerRate: number;
  profitExpectation: number;
  allowedTransporterId: number[];
  disallowedTransporterId: number[];
  numberOfTrips: number;
  numberOfAvailableTrips: number;
  loadingDistrict: string;
  unloadingDistrict: string;
  status: 'Unbidded' | 'Bidded' | 'Awarded' | string; // Extend as needed
  numberOfBids: number;
  bids: Bid[]; // You can replace `any` with a specific `Bid` interface if available
}

export interface Bid {
  remarks: string;
  id: number;
  createdAt: string; // ISO datetime
  updatedAt: string;
  sessionId: number;
  amount: number;
  submittedNumberOfTruck: number;
  acceptedNumberOfTruck: number;
  pendingNumberOfTruck: number;
  rejectedNumberOfTruck: number;
  transporterName: string;
  transporterPhoneNumber: string;
  truckType: string;
  rank: number;
  transporterId: number;
  acceptedBy: string;
  acceptedOn: string; // ISO datetime
  status: 'Placed' | 'Accepted' | 'Rejected' | 'Pending' | string; // Extend as needed
}

