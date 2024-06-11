export class UserModel {
  "id": number;
  "userId": string;
  "name": string;
  "mobile": string;
  "phone": string;
  "email": string;
  "userShortCode": string;
  "enabled": boolean;
  "role": string;
  "roles": string;
  "note": string;
  "noOfTrips": number;
  "drivingLicense": any;
  "nationalId": any;
  driverFilesUrls: {
    "drivingLicenseBack": string;
    "drivingLicenseFront": string;
    "nidBack": string;
    "nidFront": string;
    "other": string;
  };
  paymentMethod: string;
  designation: string;
  createdOn: string;
  truckStand: string;

}
