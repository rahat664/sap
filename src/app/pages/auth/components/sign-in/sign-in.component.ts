import { Component, OnInit } from '@angular/core';
import {
  FormControl,
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
import { login } from '../../ngrx/auth.action';

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

  constructor(
    private titleService: Title,
    private auth: AuthService,
    private router: Router,
    private toaster: HandleToastrService,
    private store: Store<{ auth: AuthState }>
  ) {
    this.loginRequestPayload = {
      email: '',
      password: '',
    };
  }

  ngOnInit(): void {
    this.titleService.setTitle('Login');
    this.createFormControls();
  }

  createFormControls() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loginRequestPayload.email = this.email.value;
      this.loginRequestPayload.password = this.password.value;
      this.store.dispatch(login({ payload: this.loginRequestPayload }));
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
}
