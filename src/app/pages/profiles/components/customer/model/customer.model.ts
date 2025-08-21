export class CustomerModel {
  id: number;
  userId: string;
  name: string;
  phone: string;
  email: string;
  userShortCode: string;
  enabled: boolean;
  roles: string[];
  token: string;
  address: string;
  customerCode: string;
  user: any[];
  creationDate: any;
  contactPerson: string;
  grossProfit: number;
  rank: number;
  numberOfTrips: string;
  tripType: string;
  preferredPaymentType: string;
}


export interface Customer {
  id: number;
  name: string;
  customerCode: string;
  email: string;
  phone: string;
  address: string | null;
  note: string | null;
  status: string;
  creationDate: string;
  createdBy: string;
  updatedBy: string | null;
  contactPerson: string;
  grossProfit: number | null;
  numberOfTrips: number;
  rank: number;
  tripType: string | null;
  preferredPaymentType: string;
}

export interface ContactPerson {
  contactPersonName: string;
  phone: string;
  email: string;
}

