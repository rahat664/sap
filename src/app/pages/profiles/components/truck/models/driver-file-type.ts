export const driverFileTypeModel: DriverFileType[] = [
  {
    id: 1,
    name: 'NID Front',
    max: 1,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'nidFront',
  },
  {
    id: 2,
    name: 'NID Back',
    max: 1,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'nidBack',
  },
  {
    id: 3,
    name: 'Driving License Front',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'drivingLicenseFront',
    expiryFormControlName: 'drivingLicenseExpiryDate',
  },
  {
    id: 4,
    name: 'Driving License Back',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'drivingLicenseBack',
    expiryFormControlName: 'drivingLicenseExpiryDate',
  },
  {
    id: 5,
    name: 'Other',
    max: 50,
    expiryAvailable: false,
    uploaded: false,
    multiple: true,
    formControlName: 'other',
  },
];

export interface DriverFileType {
  multiple: any;
  id: number;
  name: string;
  max: number;
  expiryAvailable: boolean;
  uploaded: boolean;
  formControlName?: string;
  expiryFormControlName?: string;
}
