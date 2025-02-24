import { TransporterDocumentType } from '../../../../../shared/Enums/registration_type';

export const transporterFileTypeModel: TransporterFileType[] = [
  {
    id: 1,
    documentType: TransporterDocumentType[TransporterDocumentType.PROFILE_PICTURE],
    name: 'Profile Picture',
    max: 1,
    expiryAvailable: false,
    uploaded: false,
    multiple: false,
    formControlName: 'profilePicture',
  },
  {
    id: 2,
    documentType: TransporterDocumentType[TransporterDocumentType.NID_FRONT],
    name: 'NID Front',
    max: 1,
    expiryAvailable: false,
    uploaded: false,
    multiple: false,
    formControlName: 'nidFront',
  },
  {
    id: 3,
    documentType: TransporterDocumentType[TransporterDocumentType.NID_BACK],
    name: 'NID Back',
    max: 1,
    expiryAvailable: false,
    uploaded: false,
    multiple: false,
    formControlName: 'nidBack',
  },
  {
    id: 4,
    documentType: TransporterDocumentType[TransporterDocumentType.TRADE_LICENSE],
    name: 'Trade License',
    max: 50,
    expiryAvailable: true,
    uploaded: false,
    multiple: true,
    formControlName: 'tradeLicense',
  }
];

export interface TransporterFileType {
  multiple: any;
  id: number;
  name?: string;
  documentType: string;
  max: number;
  expiryAvailable: boolean;
  uploaded: boolean;
  formControlName?: string;
  expiryFormControlName?: string;
}
