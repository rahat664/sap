export interface TruckDocument {
  id: number;
  fileUrl: string;
  preSignedFileUrl: string;
  documentType: string;
  createdAt: string; // Date format as string
  expiryDate: string | null; // Can be null
  createdBy: string;
}

export interface TruckModel {
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
  taxExpDate: string | null; // Can be null
  caseExpDate: string | null; // Can be null
  createdBy: string;
  updatedBy: string;
  createdOn: string; // Date format as string
  updatedOn: string; // Date format as string
  preHireCheckList: number;
  noOfTrips: number;
  truckDocumentList: TruckDocument[];
}
