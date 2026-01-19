export const truckFileType: TruckFileType[] = [
  {
    id: 1,
    name: 'Truck images',
    max: 50,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'truckImages',
    enumName: 'TRUCK_IMAGE',
  },
  {
    id: 2,
    name: 'Registration paper',
    max: 50,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'regPaperFile',
    enumName: 'REG_PAPER_FILE',
  },
  {
    id: 3,
    name: 'Fitness certificate',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'fitnessCertificateFile',
    expiryFormControlName: 'fitnessCertExpDate',
    enumName: 'FITNESS_CERTIFICATE_FILE',
  },
  {
    id: 4,
    name: 'Route permit',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'routePermitFile',
    expiryFormControlName: 'routePermitExpDate',
    enumName: 'ROUTE_PERMIT_FILE',
  },
  {
    id: 5,
    name: 'Tax paper',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'taxFile',
    expiryFormControlName: 'taxExpDate',
    enumName: 'TAX_FILE',
  },
  {
    id: 6,
    name: 'Insurance paper',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'insuranceFiles',
    expiryFormControlName: 'insuranceExpDate',
    enumName: 'INSURANCE_FILE',
  },
  {
    id: 7,
    name: 'Case paper',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'casePaperFile',
    expiryFormControlName: 'caseExpDate',
    enumName: 'CASE_FILE',
  },
  {
    id: 8,
    name: 'Others document',
    max: 50,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'others',
    enumName: 'OTHERS',
  },
];

export interface TruckFileType {
  multiple: any;
  id: number;
  name: string;
  max: number;
  expiryAvailable: boolean;
  uploaded: boolean;
  formControlName?: string;
  expiryFormControlName?: string;
  enumName: string;
}

export class TruckFilesArray {
  truckImages: any[];
  regPaperFile: any[];
  fitnessCertificateFile: any[];
  routePermitFile: any[];
  taxFile: any[];
  insuranceFiles: any[];
  casePaperFile: any[];
  otherDocFile: any[];
}
