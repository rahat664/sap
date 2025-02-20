export interface DashboardStatsModel {
  customerRateStat: customerRateStats;
  grossProfitStat: grossProfitStats;
  tripCountStat: tripCountStats;
  truckCountStat: truckCountStats;
  transporterRateStats: transporterRateStats;
  tripProfitMarginStat: tripProfitMarginStat;
}

export interface customerRateStats {
  totalCustomerRate: number;
  totalCustomerRateWithinTheDateRange: number;
}

export interface grossProfitStats {
  totalGrossProfit: number;
  totalGrossProfitWithinTheDateRange: number;
}

export interface tripProfitMarginStat {
  totalProfitMargin: number;
  dateFilteredProfitMargin: number;
}

export interface tripCountStats {
  totalTripsCompleted: number;
  totalTripsCompletedWithinTheDateRange: number;
  totalTripsCompletedWithRatesAvailable: number;
  totalTripsCompletedWithRatesAvailableAndDateRange: number;
}


export interface customerStats {
  roleName: string;
  totalCount: number;
  dateFilteredCount: number;
}

export interface userStats {
  roleName: string;
  totalCount: number;
  dateFilteredCount: number;
}

export interface truckCountStats {
  totalCount: number;
  dateFilteredCount: number;
}

export interface transporterRateStats {
  totalRate: number;
  dateFilteredRate: number;
}

export interface challanStatus {
  received: number;
  inProgress: number;
  approved: number;
  rejected: number;
  pending: number;
  totalHardCopyReceived: number;
  totalCustomerRateForPendingChallans: number;
}

export interface TripCountByStatus {
  All: number;
  Running: number;
  Booked: number;
  Completed: number;
  Unassigned: number;
  Cancelled: number;
}

export interface TopTransporters {
  transporterName: string;
  transporterPhone: string;
  transporterEmail: string;
  totalCR: number;
  totalTR: number;
  totalProfit: number;
  noOfTrips: number;
}

export interface TopCustomers {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCode: string;
  totalCustomerRate: number;
  totalGrossProfit: number;
  noOfTrip: number;
  monthName: string;
}
