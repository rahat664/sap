import {
  CreatedByUser,
  TruckDocument,
} from '../../profiles/components/truck/models/truck.model';

export class UserModel {
  'id': number;
  'userId': string;
  'name': string;
  'mobile': string;
  'phone': string;
  'email': string;
  'userShortCode': string;
  'enabled': boolean;
  'role': string;
  'roles': string[];
  'note': string;
  'noOfTrips': number;
  'bankName': string;
  'bankAccNo': string;
  'branchName': string;
  'accHolderName': string;
  'accType': string;
  completedTripCountsForDriver: number;
  'drivingLicense': any;
  'nationalId': any;
  driverFilesUrls: {
    drivingLicenseBack: string;
    drivingLicenseFront: string;
    nidBack: string;
    nidFront: string;
    other: string;
  };
  paymentMethod: {
    userId: string;
    bankName: string;
    bankAccNo: string;
    branchName: string;
    accHolderName: string;
    paymentMethod: string;
  };
  documentsList: TruckDocument[];
  createdByUser: CreatedByUser;
  PaymentMethod: string;
  designation: string;
  createdOn: string;
  truckStand: string;
  paymentMethods: string;
  drivingLicenseExpiryDate: any;
  department: string;
  status: string;
  approveStatus: string;
  rejectedReason: string;
  grossProfit: number;
  numberOfTrips: number;
  rank: number;
}
