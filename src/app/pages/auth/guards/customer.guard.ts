import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
class PermissionService {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    if (this.auth.isCustomerAdmin()) {
      return true;
    } else {
      // Redirect to the login page with the return url
      this.router.navigate(['/trip-list']);
      return false;
    }
  }
}

export const customerGuard: CanActivateFn = (route, state) => {
  return inject(PermissionService).canActivate(route, state);
};
