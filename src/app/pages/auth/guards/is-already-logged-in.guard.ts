import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
class PermissionService {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    if (this.auth.isLoggedIn()) {
      return this.router.navigate(['/trip-list']);
    } else {
      // Redirect to the login page with the return url
      return true;
    }
  }
}

export const isAlreadyLoggedInGuard: CanActivateFn = (route, state) => {
  return inject(PermissionService).canActivate(route, state);
};
