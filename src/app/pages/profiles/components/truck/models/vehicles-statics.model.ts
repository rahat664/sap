// src/app/models/statistics-summary.interfaces.ts

export interface StatisticsSummaryApiResponse {
  timestamp: string;   // ISO date-time
  status: number;      // e.g., 200
  statusCode: number;  // e.g., 200
  data: statisticsSummary;
}

/**
 * Requested model name (camelCase): statisticsSummary
 */
export interface statisticsSummary {
  completedTrip: number;   // 3
  totalRun: number;        // 215.903 (km)
  fuelConsumed: number;    // 43.1806 (L)
  carbonOmitted: number;   // 115.724008
  details: StatisticsDetail[];
}

export interface StatisticsDetail {
  id: number;              // 4818
  tripId: string;          // "BPEA-4818"
  startTime: string;       // ISO date-time
  totalDistance: number;   // 214.003
  fuelConsumed: number;    // 42.8006
  carbonOmitted: number;   // 114.705608
}

/** Optional: alias for PascalCase usage if your linter prefers it */
export type StatisticsSummary = statisticsSummary;

/** Optional: a ready-to-use zeroed initial value */
export const statisticsSummaryInit: statisticsSummary = {
  completedTrip: 0,
  totalRun: 0,
  fuelConsumed: 0,
  carbonOmitted: 0,
  details: []
};
