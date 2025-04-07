// trip.model.ts (Trip Data Model)
export interface TransporterPayment {
  id: number;
  tripId: string;
  customerName: string;
  customerCode: string;
  tripStartDatetime: string;
  truckSize: string;
  truckCapacityInTon: string;
  vehicleCategory: {
    name: string;
    imageUrl: string;
  };
  good: {
    id: number;
    name: string;
  };
  tripPoints: Array<{
    id: number;
    pointDistrict: string;
    pointName: string;
    pointType: string;
    pointLat: number;
    pointLon: number;
  }>;
  truck: {
    id: number;
    registrationZone: string;
    registrationCategory: string;
    registrationSerial: string;
    registrationNum: string;
  };
  company: string;
  loadingPoint: string;
  unloadingPoint: string;
  status: string;
  customerRate: number;
  transporterRate: number;
  grossProfit: number;
  profitMargin: number;
  priority: boolean;
  createdAt: string;
  challanStatus: string;
  transporterCode: string;
  transporterName?: string;
  transporterPhone?: string;
  challanStatusUpdatedAt?: string | null;
  tripEndedAt: string;
  challanStatusUpdatedBy?: string | null;
  challanHardCopyReceivedAt?: string | null;
  challanHardCopyReceivedBy?: string | null;
  incidentOccurred: boolean;
  paymentType: string;
  tripType?: string | null;
  paymentAmountToTransporter: number;
  lastPaymentDateToTransporter?: string | null;
  firstChallanUploadedDate?: string | null;
  createdBy: string;
  createdByName: string;
  createdByPhone: string;
}

export interface TransporterPaymentDetails {
  financialInstituteName: string;
  id: number;
  tripId: string;
  transporterCode: string;
  transporterName: string;
  paidUserId: string;
  paidUserName: string;
  customerCode: string;
  customerName: string;
  driverCode: string;
  driverName: string;
  vehicleCode: string;
  vehicleNumber: string;
  amount: number;
  paymentDate: string; // ISO date string (e.g. "2025-04-07T12:54:54.28325")
  paymentMethod: string; // e.g. "CASH", "BANK", "MFS", etc.
}

