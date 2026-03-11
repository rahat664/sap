/** ===== Enums / Unions ===== */

/** Overall maintenance job status */
export type WorkshopStatus =
  | 'SCHEDULED'
  | 'AT_WORKSHOP'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'PENDING_APPROVAL'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';

/** How payment was (or will be) made */
export type PaymentMethod =
  | 'CASH'
  | 'CARD' // Credit/debit card
  | 'MOBILE_BANKING' // bKash, Nagad, Rocket, etc.
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'OTHER';

/** Current payment status */
export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'REFUNDED';

/** Approval flow status */
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Handy option arrays for dropdowns */
export const WORKSHOP_STATUS_OPTIONS: ReadonlyArray<WorkshopStatus> = [
  'SCHEDULED',
  'AT_WORKSHOP',
  'IN_PROGRESS',
  'ON_HOLD',
  'PENDING_APPROVAL',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
] as const;

export const PAYMENT_METHOD_OPTIONS: ReadonlyArray<PaymentMethod> = [
  'CASH',
  'CARD',
  'MOBILE_BANKING',
  'BANK_TRANSFER',
  'CHEQUE',
  'OTHER',
] as const;

export const PAYMENT_STATUS_OPTIONS: ReadonlyArray<PaymentStatus> = [
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'REFUNDED',
] as const;

export const APPROVAL_STATUS_OPTIONS: ReadonlyArray<ApprovalStatus> = [
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;

/** ===== Create DTO (request body) =====
 * Keep date-time fields as ISO strings.
 * If your form produces numbers as strings (e.g., "3"), coerce before sending.
 */
export interface WorkshopHistoryCreateDto {
  /** Prefer number. If your API accepts string IDs, you may use number | string in your app layer. */
  vehicleId: number;
  id?: number;

  vendorName: string;
  vendorAddress: string;

  vendorPhone?: string;

  /** When the vehicle entered the workshop (ISO 8601) */
  entryDate: string;

  /** When work was completed (ISO 8601) */
  completedDate?: string;

  /** What was done */
  maintenanceDescription: string;

  /** Notes for future care */
  caution?: string;

  /** Items not finished in this visit */
  pendingMaintenanceDescription?: string;

  /** Overall workflow status */
  status: WorkshopStatus;

  /** Next scheduled visit (ISO 8601) */
  nextScheduledDate?: string;

  /** Money fields (in BDT) */
  price: number; // e.g., 15000.00
  discount: number; // e.g., 1000.00
  payableAmount: number; // usually price - discount
  paidAmount: number; // e.g., 10000.00
  dueAmount: number; // usually payableAmount - paidAmount

  /** Payment details */
  paymentStatus: PaymentStatus; // e.g., 'PARTIALLY_PAID'
  paymentMethod: PaymentMethod; // e.g., 'CASH'
  paymentDescription?: string;

  /** Responsibility & approvals */
  responsiblePerson?: string; // e.g., user code
  approvedBy?: string; // e.g., manager code
  approvalStatus?: ApprovalStatus; // e.g., 'APPROVED'

  /** Timestamps (ISO 8601) */
  approvedAt?: string;
  paidAt?: string;
  dueAt?: string;
}

/** ===== Optional: tiny helpers to keep amounts consistent in UI ===== */
export function computePayable(price: number, discount: number): number {
  return Math.max(0, Number(price) - Number(discount));
}

export function computeDue(payableAmount: number, paidAmount: number): number {
  return Math.max(0, Number(payableAmount) - Number(paidAmount));
}
