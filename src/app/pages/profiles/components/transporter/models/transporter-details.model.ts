export interface PaymentMethod {
  id: number;
  userId: string;
  paymentMethod: string;
  name: string;
  bankAccNo: string;
  branchName: string;
  accHolderName: string;
  accType: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface User {
  id: number;
  createdAt: string;
  userId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  enabled: boolean;
  status: string;
  locked: boolean;
  emailSend: boolean;
  relatedEntityName: string;
  relatedEntityId: number;
}

export interface TransporterDocument {
  id: number;
  fileUrl: string;
  preSignedFileUrl: string;
  documentType: string;
  createdAt: string;
  expiryDate: string | null;
  createdBy: string;
}

export interface Transporter {
  id: number;
  createdAt: string;
  code: string;
  name: string;
  address: string;
  contactPersonName: string;
  contactPersonNumber: string;
  contactPersonEmail: string;
  truckStand: string;
  defaultPaymentMethod: PaymentMethod;
  note: string;
  nidFront: number;
  nidBack: number;
  tradeLicense: number;
  user: User;
  documentsList: TransporterDocument[];
}
