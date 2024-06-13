export interface TruckInnerModel {
  id: number;
  name: string | null;
  registration_zone: string;
  registration_category: string;
  registration_serial: string;
  registration_num: string;
  driver_code: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  helper_code: string | null;
  helper_name: string | null;
  helper_phone: string | null;
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
