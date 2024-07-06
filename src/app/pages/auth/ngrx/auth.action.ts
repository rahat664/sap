// src/app/store/actions/auth.actions.ts
import { createAction, props } from '@ngrx/store';
import { LoginRequest } from '../models/request/login-request';
import { ApiResponse } from '../models/response/api-response';

export const login = createAction(
  '[Auth] Login',
  props<{ payload: LoginRequest }>(),
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: ApiResponse }>(),
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>(),
);

export const logout = createAction('[Auth] Logout');
// src/app/store/effects/auth.effects.ts
