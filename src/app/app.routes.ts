import { Routes } from '@angular/router';
import {authGuard} from "./pages/auth/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Login',
    loadComponent: () => import('./pages/auth/components/sign-in/sign-in.component').then(c => c.SignInComponent)
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'trip-list',
    title: 'Trip List',
    loadComponent: () => import('./pages/trip-list/trip-list.component').then(c => c.TripListComponent)
  },
  {
    path: 'user-management',
    title: 'User Management',
    loadComponent: () => import('./pages/user-management/user-management.component').then(c => c.UserManagementComponent)
  },
  {
    path: 'profile',
    title: 'Profile',
    loadChildren: () => import('./pages/profiles/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: '',
    redirectTo: 'trip-list',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'trip-list',
    pathMatch: 'full'
  }
];
