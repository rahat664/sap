export const truckFileType: TruckFileType[] = [
  {
    id: 1,
    name: 'Truck images',
    max: 10,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'truckImages',
  },
  {
    id: 2,
    name: 'Registration paper',
    max: 2,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'regPaperFile',
  },
  {
    id: 3,
    name: 'Fitness certificate',
    max: 2,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'fitnessCertificateFile',
    expiryFormControlName: 'fitnessCertExpDate',
  },
  {
    id: 4,
    name: 'Route permit',
    max: 2,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'routePermitFile',
    expiryFormControlName: 'routePermitExpDate',
  },
  {
    id: 5,
    name: 'Tax paper',
    max: 2,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'taxFile',
    expiryFormControlName: 'taxExpDate',
  },
  {
    id: 6,
    name: 'Insurance paper',
    max: 2,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'insuranceFiles',
    expiryFormControlName: 'insuranceExpDate',
  },
  {
    id: 7,
    name: 'Case paper',
    max: 2,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'casePaperFile',
    expiryFormControlName: 'caseExpDate',
  },
  {
    id: 8,
    name: 'Others document',
    max: 2,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'otherDocFile',
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
