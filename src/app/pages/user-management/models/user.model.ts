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
  PaymentMethod: string;
  designation: string;
  createdOn: string;
  truckStand: string;
  paymentMethods: string;
  drivingLicenseExpiryDate: any;
  department: string;
  status: string;
}
