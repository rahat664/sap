import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor() {}


  isPermitted(module:string, action:string): boolean {
    // Read and safely parse permissions from localStorage
    const raw = localStorage.getItem('permissions');
    if (!raw) return false;
    let permissions: any;
    try {
      permissions = JSON.parse(raw);
    } catch {
      return false;
    }

    // Support object map: { [module]: string[] }
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      const allowed = permissions[module];
      if (Array.isArray(allowed)) return allowed.includes(action);
      // Some backends store as object: { [module]: { actions: string[] } }
      if (allowed && Array.isArray(allowed.actions)) return allowed.actions.includes(action);
      return false;
    }

    // Support flat array of permissions like: ['trip:create', 'user:view_all']
    if (Array.isArray(permissions)) {
      const key = `${module}:${action}`;
      return permissions.includes(key);
    }

    return false;
  }

}
