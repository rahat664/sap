import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }
  getErrorMessage(value:any) {
    if (value?.get('phone').hasError('invalidNumber')) {
      return 'Please enter a valid phone number';
    } else {
      return '';
    }
  }

  getErrorMessageWithTouch(value: any) {
    if (value?.get('phone').hasError('required')) {
      return 'You must enter a value';
    } else if (value?.get('phone').hasError('minLength')) {
      return 'Phone number must be 11 digit';
    } else if (value?.get('phone').hasError('maxLength')) {
      return 'Phone number must be 11 digit';
    } else if (value?.get('phone').hasError('invalidNumber')) {
      return 'Phone number must start with 01';
    } else {
      return '';
    }
  }

  getDriverNumberValidation(value: any) {
    if (value?.hasError('required')) {
      return 'You must enter a value';
    }  if(value?.hasError('pattern')){
      return 'Only numbers are allowed';
    }  if (value?.hasError('minlength')) {
      return 'Phone number must be 11 digit';
    }  if (value?.hasError('maxlength')) {
      return 'Phone number must be 11 digit';
    }  if (value?.hasError('invalidNumber')) {
      return 'Phone number must start with 01';
    } else {
      return '';
    }
  }

  mobileNumberValidation(value: any, customerForm: any) {
    // set error if the starting two digits are not 01
    if (isNaN(value)) {
      customerForm?.get('phone').setValue(value.substring(0, value.length - 1));
    }
    if (value?.substring(0, 1) != '0' && value.substring(0, 1)) {
      // return error to the parent
      return customerForm?.get('phone').setErrors({invalidNumber: true});
    }
    if (value?.substring(1, 2) != '1' && value.substring(1, 2)) {
      // return error to the parent
      return customerForm?.get('phone').setErrors({invalidNumber: true});
    }

    // prevent the change if the value is not a number
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

  getDropdownValidation(value: any) {
    if (value?.hasError('required')) {
      return 'You must select a value';
    } else {
      return '';
    }
  }

  getRegistrationSerialValidation(value: any) {
    if (value?.hasError('required')) {
      return 'You must enter a value';
    } else if(value?.hasError('pattern')){
      return 'Only numbers are allowed';
    } else if (value?.hasError('minlength')) {
      return 'Registration Serial must be 2 digit';
    } else if (value?.hasError('maxlength')) {
      return 'Registration Serial must be 2 digit';
    } else {
      return '';
    }
  }
  getRegistrationNoValidation(value: any) {
    if (value?.hasError('required')) {
      return 'You must enter a value';
    } else if(value?.hasError('pattern')){
      return 'Only numbers are allowed';
    } else if (value?.hasError('minlength')) {
      return 'Registration No must be 4 digit';
    } else if (value?.hasError('maxlength')) {
      return 'Registration No must be 4 digit';
    } else {
      return '';
    }
  }
}
