import { AbstractControl, FormGroup } from '@angular/forms';

const DEFAULT_PHONE_CONTROL_NAMES = [
  'phone',
  'phoneNumber',
  'mobile',
  'mobileNumber',
  'driverPhone',
  'vendorPhone',
  'transporterPhone',
  'helperPhone',
  'contactPersonPhone',
  'contactPersonNumber',
];

function hasPhoneMismatch(control: AbstractControl | null): boolean {
  if (!control) {
    return false;
  }
  return (
    control.hasError('invalidNumber') ||
    control.hasError('minlength') ||
    control.hasError('maxlength') ||
    control.hasError('minLength') ||
    control.hasError('maxLength')
  );
}

export function hasPhoneCountryMismatch(
  form: FormGroup | null | undefined,
  controlNames: string[] = DEFAULT_PHONE_CONTROL_NAMES
): boolean {
  if (!form) {
    return false;
  }
  return controlNames.some(name => hasPhoneMismatch(form.get(name)));
}
