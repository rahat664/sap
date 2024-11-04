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
    if (this.auth.isAdmin()) {
      return true;
    } else {
      // Redirect to the login page with the return url
      this.router.navigate(['/trip-list']);
      return false;
    }
  }
}

export const roleGuard: CanActivateFn = (route, state) => {
  return inject(PermissionService).canActivate(route, state);
};
