export interface LoginPhoneRequest {
  phoneNumber: string;
}

export interface LoginRequestUsingPhonePayload {
  phoneNumber: string;
  otpCode: string;
}
