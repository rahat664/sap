import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor() {}


  isPermitted(module:string, action:string): boolean {
    // Here you would typically check the user's permissions against a list of allowed actions
    // For now, we will just return true for demonstration purposes
    // You can replace this with actual permission logic
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions[module] && permissions[module].includes(action);
  }

}
