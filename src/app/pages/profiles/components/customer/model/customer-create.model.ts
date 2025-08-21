export class CustomerCreateModel {
  name: string;
  email: string;
  role: string;
  contactPerson: string;
  phone: string;
  address: string;
  customerCode: string;
  sendEmail: boolean;
  note: string;
  tripType: string;
  preferredPaymentType: string;
}

export class UpdateCustomerModel {
  id: string;
  name: string;
  email: string;
  role: string;
  contactPerson: string;
  phone: string;
  address: string;
  note: string;
  tripType: string;
  preferredPaymentType: string;
}
