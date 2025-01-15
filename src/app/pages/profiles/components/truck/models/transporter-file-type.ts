import { TransporterFileType } from './driver-file-type';

export const transporterFileTypeModel: TransporterFileType[] = [
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
];
