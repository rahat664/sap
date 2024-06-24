export interface TruckInnerModel {
  id: number;
  name: string | null;
  registrationZone: string;
  registrationCategory: string;
  registrationSerial: string;
  registrationNum: string;
  driverCode: string | null;
  driverName: string | null;
  driverPhone: string | null;
  helperCode: string | null;
  helperName: string | null;
  helperPhone: string | null;
  regPaperFile: string | null;
  fitnessFile: string | null;
  routePermitFile: string | null;
  taxFile: string | null;
  caseFile: string | null;
  otherFile: string | null;
  fitnessCertExpDate: string | null;
  routePermitExpDate: string | null;
  taxExpDate: string | null;
  caseExpDate: string | null;
  preHireCheckList: string | null;
  numberOfTrips: number;
  tracker: string | null;
}
