import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  getErrorMessage(value: FormGroup) {
    if (value?.get('phone').hasError('invalidNumber')) {
      return 'Invalid number';
    } else {
      return '';
    }
  }

  getErrorMessageWithTouch(value: FormGroup) {
    if (value?.get('phone').hasError('required')) {
      return 'Number required';
    } else if (value?.get('phone').hasError('minLength')) {
      return 'Invalid number';
    } else if (value?.get('phone').hasError('maxLength')) {
      return 'Invalid  number';
    } else if (value?.get('phone').hasError('invalidNumber')) {
      return 'Invalid  number';
    } else {
      return '';
    }
  }

  getDriverNumberValidation(value: AbstractControl) {
    if (value?.hasError('required')) {
      return 'Driver number required';
    }
    if (value?.hasError('pattern')) {
      return 'Invalid number';
    }
    if (value?.hasError('minlength')) {
      return 'Invalid number';
    }
    if (value?.hasError('maxlength')) {
      return 'Invalid number';
    }
    if (value?.hasError('invalidNumber')) {
      return 'Invalid number';
    } else {
      return '';
    }
  }

  mobileNumberValidation(value: string, customerForm: FormGroup) {
    // set error if the starting two digits are not 01
    if (isNaN(Number(value))) {
      customerForm
        ?.get('phone')
        .setValue(value?.substring(0, value?.length - 1));
    }
    if (value?.substring(0, 1) != '0' && value?.substring(0, 1)) {
      // return error to the parent
      return customerForm?.get('phone').setErrors({ invalidNumber: true });
    }
    if (value?.substring(1, 2) != '1' && value?.substring(1, 2)) {
      // return error to the parent
      return customerForm?.get('phone').setErrors({ invalidNumber: true });
    }
    if (value?.substring(2, 3) < '3' && value?.substring(2, 3)) {
      // return error to the parent
      return customerForm?.get('phone').setErrors({ invalidNumber: true });
    }

    // prevent the change if the value is not a number
    // take only numbers
    const onlyNumbers = value?.replace(/[^\d]/g, '');
    // if the length is greater than 11 prevent the change
    if (onlyNumbers?.length > 11) {
      customerForm?.get('phone').setValue(onlyNumbers.substring(0, 11));
    }
    // if the length is less than 11 give error
    if (onlyNumbers?.length < 11) {
      customerForm?.get('phone').setErrors({ minLength: true });
    }
  }

  getDropdownValidation(value: AbstractControl) {
    if (value?.hasError('required')) {
      return 'You must select a value';
    } else {
      return '';
    }
  }

  getRegistrationSerialValidation(value: AbstractControl) {
    if (value?.hasError('required')) {
      return 'Registration serial required';
    } else if (value?.hasError('pattern')) {
      return 'Invalid input';
    } else if (value?.hasError('minlength')) {
      return 'Invalid input';
    } else if (value?.hasError('maxlength')) {
      return 'Invalid input';
    } else {
      return '';
    }
  }

  getRegistrationNoValidation(value: AbstractControl) {
    if (value?.hasError('required')) {
      return 'Registration No required';
    } else if (value?.hasError('pattern')) {
      return 'Invalid input';
    } else if (value?.hasError('minlength')) {
      return 'Invalid input';
    } else if (value?.hasError('maxlength')) {
      return 'Invalid input';
    } else {
      return '';
    }
  }
}
