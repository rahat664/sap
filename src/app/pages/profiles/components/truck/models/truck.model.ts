export class TruckDocument {
  id: number;
  fileUrl: string;
  preSignedFileUrl: string;
  documentType: string;
  createdAt: string; // Date format as string
  expiryDate: string | null; // Can be null
  createdBy: string;
}

export interface TruckModel {
  currentCondition: string;
  rejectedReason: string | null; // Can be null
  id: number;
  name: string | null; // Can be null
  registrationZone: string;
  registrationCategory: string;
  registrationSerial: string;
  registrationNum: string;
  fullRegistrationNumber: string;
  driverCode: string | null; // Can be null
  driverName: string | null; // Can be null
  driverPhone: string | null; // Can be null
  helperCode: string | null; // Can be null
  helperName: string | null; // Can be null
  helperPhone: string | null; // Can be null
  regPaperFile: string;
  fitnessFile: string;
  routePermitFile: string;
  taxFile: string | null; // Can be null
  caseFile: string | null; // Can be null
  otherFile: string | null; // Can be null
  fitnessCertExpDate: string; // Date format as string
  routePermitExpDate: string | null; // Can be null
  insuranceExpDate: string | null; // Can be null
  taxExpDate: string | null; // Can be null
  caseExpDate: string | null; // Can be null
  createdBy: string;
  updatedBy: string;
  createdOn: string; // Date format as string
  updatedOn: string; // Date format as string
  preHireCheckList: number;
  noOfTrips: number;
  condition: string;
  lastRecordedLat: number;
  lastRecordedLng: number;
  currentSpeed: number;
  status: string;
  truckDocumentList: TruckDocument[];
  createdByUser: CreatedByUser;
}

export interface CreatedByUser {
  id: string | null;
  userId: string;
  userShortCode: string;
  name: string;
  phone: string;
  email: string;
  password: string | null;
  enabled: boolean;
  lastPasswordResetDate: Date | null;
  contactPerson: string | null;
  address: string | null;
  note: string | null;
  roles: string[] | null;
  status: string | null;
  createdOn: Date | null;
  designation: string | null;
  drivingLicenseFront: string | null;
  drivingLicenseBack: string | null;
  nidFront: string | null;
  nidBack: string | null;
  other: string | null;
  department: string | null;
  customer: string | null;
  associatedCustomerCode: string | null;
  username: string;
  authorities: string[] | null;
}
