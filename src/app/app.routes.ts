import { Routes } from '@angular/router';
import { authGuard } from './pages/auth/guards/auth.guard';
import { isAlreadyLoggedInGuard } from './pages/auth/guards/is-already-logged-in.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Login',
    loadComponent: () =>
      import('./pages/auth/components/sign-in/sign-in.component').then(
        c => c.SignInComponent
      ),
    canActivate: [isAlreadyLoggedInGuard],
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        c => c.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'trip-list',
    title: 'Trip List',
    loadComponent: () =>
      import('./pages/trip-list/trip-list.component').then(
        c => c.TripListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'trip-list/trip-create',
    title: 'Trip Create',
    loadComponent: () =>
      import('./pages/trip-list/components/new-trip/new-trip.component').then(
        c => c.NewTripComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-management',
    title: 'User Management',
    loadComponent: () =>
      import('./pages/user-management/user-management.component').then(
        c => c.UserManagementComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    title: 'Profile',
    loadChildren: () =>
      import('./pages/profiles/profile.routes').then(m => m.profileRoutes),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'trip-list',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'trip-list',
    pathMatch: 'full',
  },
];
