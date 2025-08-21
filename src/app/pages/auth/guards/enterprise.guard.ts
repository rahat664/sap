import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
class permissionService {
  constructor(private router: Router) {
  }
  customerIsNotEnterprise() {
    return localStorage.getItem('enterpriseCode') !== 'E-3'
  }

  canActivate(_route: ActivatedRouteSnapshot, _state:RouterStateSnapshot) {
    if (this.customerIsNotEnterprise()) {
      return true;
    } else {
      // Redirect to the login page with the return url
      this.router.navigate(['/manage-trip'])
      return false;
    }
  }
}

export const enterpriseGuard: CanActivateFn = (route, state) => {
  return inject(permissionService).canActivate(route, state);
};
