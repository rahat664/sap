// trip.model.ts (Trip Data Model)
export interface Trip {
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

