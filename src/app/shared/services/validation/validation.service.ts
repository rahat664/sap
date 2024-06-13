import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }
  getErrorMessage(value:any) {
    if (value?.get('phone').hasError('required')) {
      return 'You must enter a value';
    }
    if (value?.get('phone').hasError('invalidNumber')) {
      return 'Phone number must start with 01';
    }
    if (value?.get('phone').hasError('minLength')) {
      return 'Phone number must be 11 digit';
    }
    if (value?.get('phone').hasError('pattern')) {
      return 'Phone number must be a number';
    } if (value?.get('phone').hasError('email')) {
      return 'Not a valid email';
    } else {
      return '';
    }
  }
  mobileNumberValidation(value: any, customerForm: any) {
    // set error if the starting two digits are not 01
    if (value?.substring(0, 2) != '01') {
      // return error to the parent
      return customerForm?.get('phone').setErrors({invalidNumber: true});
    }

    // prevent the change if the value is not a number
    if (isNaN(value)) {
      customerForm?.get('phone').setValue('');
    }
    // take only numbers
    let onlyNumbers = value?.replace(/[^\d]/g, '');
    // if the length is greater than 11 prevent the change
    if (onlyNumbers.length > 11) {
      customerForm?.get('phone').setValue(onlyNumbers.substring(0, 11));
    }
    // if the length is less than 11 give error
    if (onlyNumbers.length < 11) {
     customerForm?.get('phone').setErrors({minLength: true});
    }
  }
}
