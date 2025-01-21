// src/app/store/actions/auth.actions.ts
import { createAction, props } from '@ngrx/store';
import { LoginRequest } from '../models/request/login-request';
import { ApiResponse } from '../models/response/api-response';
import { LoginRequestUsingPhonePayload } from '../models/request/login-phone-request';

export const login = createAction(
  '[Auth] Login',
  props<{ payload: LoginRequest }>()
);

export const loginUsingPhoneNumber = createAction(
  '[Auth] Login Using Phone Number',
  props<{ payload: LoginRequestUsingPhonePayload }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: ApiResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

export const logout = createAction('[Auth] Logout');
props<{ error: any }>();
// src/app/store/effects/auth.effects.ts
