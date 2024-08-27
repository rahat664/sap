import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginRequest } from '../../models/request/login-request';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HandleToastrService } from '../../../../shared/services/handle-toastr/handle-toastr.service';
import { AuthState } from '../../ngrx/auth.reducer';
import { Store } from '@ngrx/store';
import { selectAuthError, selectAuthLoading } from '../../ngrx/auth.selectors';
import { login, loginUsingPhoneNumber } from '../../ngrx/auth.action';
import {
  LoginPhoneRequest,
  LoginRequestUsingPhonePayload,
} from '../../models/request/login-phone-request';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  title = 'Login';
  loginForm: FormGroup;
  loginRequestPayload: LoginRequest;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  usingEmail: boolean = true;

  loginUsingPhonePayload: LoginPhoneRequest;
  loginPhoneRequestPayload: LoginRequestUsingPhonePayload;
  otpScreen: boolean;

  constructor(
    private titleService: Title,
    private auth: AuthService,
    private router: Router,
    private toaster: HandleToastrService,
    private store: Store<{ auth: AuthState }>,
    private fb: FormBuilder
  ) {
    this.loginRequestPayload = {
      email: '',
      password: '',
    };
    this.loginUsingPhonePayload = {
      phoneNumber: '',
    };
    this.loginPhoneRequestPayload = {
      phoneNumber: '',
      otpCode: '',
    };
  }

  ngOnInit(): void {
    this.titleService.setTitle('Login');
    this.createFormControls();
  }

  createFormControls() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: [''],
      otp1: [''],
      otp2: [''],
      otp3: [''],
      otp4: [''],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get phoneNumber() {
    return this.loginForm.get('phoneNumber');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      if (this.usingEmail) {
        this.loginRequestPayload.email = this.email.value;
        this.loginRequestPayload.password = this.password.value;
        this.store.dispatch(login({ payload: this.loginRequestPayload }));
      } else {
        this.loginUsingPhonePayload.phoneNumber = this.phoneNumber.value;
        this.auth.loginUsingPhone(this.loginUsingPhonePayload).subscribe(
          (response: any) => {
            if (response.status === 'OK') {
              this.otpScreen = true;
              this.loginForm.get('otp1').setValidators([Validators.required]);
              this.loginForm.get('otp2').setValidators([Validators.required]);
              this.loginForm.get('otp3').setValidators([Validators.required]);
              this.loginForm.get('otp4').setValidators([Validators.required]);
              this.loginForm.get('otp1').updateValueAndValidity();
              this.loginForm.get('otp2').updateValueAndValidity();
              this.loginForm.get('otp3').updateValueAndValidity();
              this.loginForm.get('otp4').updateValueAndValidity();
              this.otpScreen = true;
            } else {
              this.toaster.showError(response.message, '');
            }
          },
          error => {
            this.toaster.showError(error.error.message, '');
          }
        );
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePassword() {
    const password = document.getElementById('password');
    const icon = document.getElementById('icon');
    if (password.getAttribute('type') === 'password') {
      password.setAttribute('type', 'text');
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      password.setAttribute('type', 'password');
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  }

  getEmailError() {
    if (this.email.hasError('required')) {
      return 'Email is required';
    } else if (this.email.hasError('minlength')) {
      return 'Invalid email';
    } else if (this.email.hasError('pattern')) {
      return 'Invalid email';
    } else if (this.email.hasError('email')) {
      return 'Invalid email';
    } else {
      return '';
    }
  }

  getPasswordError() {
    if (this.password.hasError('required')) {
      return 'Password required';
    } else if (this.password.hasError('minlength')) {
      return 'Invalid password';
    } else {
      return '';
    }
  }

  onClickUseMobileNumber() {
    this.loginForm.get('email').clearValidators();
    this.loginForm.get('email').updateValueAndValidity();
    this.loginForm.get('email').setValue('');
    this.loginForm.get('password').setValue('');
    this.loginForm.get('password').clearValidators();
    this.loginForm.get('password').updateValueAndValidity();
    this.loginForm.get('phoneNumber').setValidators([Validators.required]);
    this.loginForm.get('phoneNumber').valueChanges.subscribe(value => {
      // user cannot give string value
      if (isNaN(Number(value))) {
        this.loginForm
          ?.get('phoneNumber')
          .setValue(value?.substring(0, value?.length - 1));
      }
      if (value?.substring(0, 1) != '0' && value?.substring(0, 1)) {
        // return error to the parent
        return this.loginForm
          ?.get('phoneNumber')
          .setErrors({ invalidNumber: true });
      }
      if (value?.substring(1, 2) != '1' && value?.substring(1, 2)) {
        // return error to the parent
        return this.loginForm
          ?.get('phoneNumber')
          .setErrors({ invalidNumber: true });
      }

      if (value?.substring(2, 3) < '3' && value?.substring(2, 3)) {
        // return error to the parent
        return this.loginForm
          ?.get('phoneNumber')
          .setErrors({ invalidNumber: true });
      }

      // prevent the change if the value is not a number
      // take only numbers
      const onlyNumbers = value?.replace(/[^\d]/g, '');
      // if the length is greater than 11 prevent the change
      if (onlyNumbers?.length > 11) {
        this.loginForm
          ?.get('phoneNumber')
          .setValue(onlyNumbers.substring(0, 11));
      }
      // if the length is less than 11 give error
      if (onlyNumbers?.length < 11) {
        return this.loginForm
          ?.get('phoneNumber')
          .setErrors({ minLength: true });
      }
    });
    this.usingEmail = false;
  }

  onClickUseEmail() {
    this.loginForm.get('phoneNumber').clearValidators();
    this.loginForm.get('phoneNumber').updateValueAndValidity();
    this.loginForm.get('phoneNumber').setValue('');
    this.loginForm
      .get('email')
      .setValidators([Validators.required, Validators.email]);
    this.loginForm.get('email').updateValueAndValidity();
    this.loginForm.get('password').setValidators([Validators.required]);
    this.loginForm.get('password').updateValueAndValidity();
    this.usingEmail = true;
  }

  getPhoneNumberError() {
    if (this.phoneNumber.hasError('required')) {
      return 'Phone number required';
    } else if (this.phoneNumber.hasError('minlength')) {
      return 'Invalid phone number';
    } else if (this.phoneNumber.hasError('invalidNumber')) {
      return 'Invalid phone number';
    } else {
      return '';
    }
  }

  onOtpLogin() {
    this.loginPhoneRequestPayload.phoneNumber = this.phoneNumber.value;
    this.loginPhoneRequestPayload.otpCode = `${this.loginForm.get('otp1').value}${this.loginForm.get('otp2').value}${this.loginForm.get('otp3').value}${this.loginForm.get('otp4').value}`;
    this.store.dispatch(
      loginUsingPhoneNumber({ payload: this.loginPhoneRequestPayload })
    );
  }
}
